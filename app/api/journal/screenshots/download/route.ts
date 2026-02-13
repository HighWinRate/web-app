import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/journal/screenshots/download?path=...
 * Download and serve a screenshot with authentication
 */
export async function GET(request: NextRequest) {
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
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'مسیر فایل الزامی است' },
        { status: 400 }
      );
    }

    // Extract just the filename part if it's a full URL
    let cleanPath = filePath;
    if (filePath.includes('/storage/v1/object/public/journal-screenshots/')) {
      const parts = filePath.split('/storage/v1/object/public/journal-screenshots/');
      cleanPath = parts[1];
    }

    // Verify the file belongs to the user
    if (!cleanPath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: 'دسترسی به این فایل ندارید' },
        { status: 403 }
      );
    }

    // Download file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('journal-screenshots')
      .download(cleanPath);

    if (error || !data) {
      console.error('Download error:', error);
      return NextResponse.json(
        { error: 'خطا در دریافت فایل' },
        { status: 500 }
      );
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await data.arrayBuffer();

    // Return image with proper headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': data.type || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Download screenshot error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
