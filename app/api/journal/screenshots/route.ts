import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/journal/screenshots
 * Upload a screenshot to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entryId = formData.get('entry_id') as string;
    const type = formData.get('type') as 'entry' | 'exit'; // entry_screenshot or exit_screenshot

    if (!file || !entryId || !type) {
      return NextResponse.json(
        { error: 'فایل، شناسه ورودی و نوع الزامی است' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'فقط فایل‌های تصویری مجاز هستند' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'حجم فایل نباید بیشتر از 5 مگابایت باشد' },
        { status: 400 }
      );
    }

    // Verify entry ownership
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .select('id, user_id')
      .eq('id', entryId)
      .single();

    if (entryError || !entry || entry.user_id !== user.id) {
      return NextResponse.json(
        { error: 'ورودی یافت نشد یا دسترسی ندارید' },
        { status: 404 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${entryId}_${type}_${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('journal-screenshots')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'خطا در آپلود فایل' },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('journal-screenshots').getPublicUrl(fileName);

    // Update journal entry with screenshot URL
    const columnName =
      type === 'entry' ? 'entry_screenshot_url' : 'exit_screenshot_url';

    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({ [columnName]: publicUrl })
      .eq('id', entryId);

    if (updateError) {
      // Rollback: delete uploaded file
      await supabase.storage.from('journal-screenshots').remove([fileName]);
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'خطا در به‌روزرسانی ورودی' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Screenshot upload error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/journal/screenshots?entry_id=...&type=entry|exit
 * Delete a screenshot from Supabase Storage
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entry_id');
    const type = searchParams.get('type') as 'entry' | 'exit';

    if (!entryId || !type) {
      return NextResponse.json(
        { error: 'شناسه ورودی و نوع الزامی است' },
        { status: 400 }
      );
    }

    // Get entry with screenshot URL
    const columnName =
      type === 'entry' ? 'entry_screenshot_url' : 'exit_screenshot_url';

    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .select(`id, user_id, ${columnName}`)
      .eq('id', entryId)
      .single();

    if (entryError || !entry || entry.user_id !== user.id) {
      return NextResponse.json(
        { error: 'ورودی یافت نشد یا دسترسی ندارید' },
        { status: 404 }
      );
    }

    const screenshotUrl = entry[columnName as keyof typeof entry] as
      | string
      | null;

    if (!screenshotUrl) {
      return NextResponse.json(
        { error: 'اسکرین‌شاتی برای حذف وجود ندارد' },
        { status: 404 }
      );
    }

    // Extract file path from public URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/journal-screenshots/user_id/filename
    const urlParts = screenshotUrl.split('/storage/v1/object/public/journal-screenshots/');
    const filePath = urlParts[1];

    if (!filePath) {
      return NextResponse.json(
        { error: 'URL فایل نامعتبر است' },
        { status: 400 }
      );
    }

    // Verify the file belongs to the user
    if (!filePath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: 'دسترسی به این فایل ندارید' },
        { status: 403 }
      );
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('journal-screenshots')
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Continue anyway to update DB
    }

    // Update journal entry to remove URL
    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({ [columnName]: null })
      .eq('id', entryId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'خطا در به‌روزرسانی ورودی' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'اسکرین‌شات با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Screenshot delete error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
