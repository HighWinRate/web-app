import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getEntryById, updateEntry, deleteEntry } from '@/lib/data/journal';
import type { UpdateJournalEntryData } from '@/lib/types/journal';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const { id } = await params;
    const entry = await getEntryById(id);

    if (!entry) {
      return NextResponse.json({ error: 'ورودی یافت نشد' }, { status: 404 });
    }

    // Verify ownership
    if (entry.user_id !== user.id) {
      return NextResponse.json({ error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const body: UpdateJournalEntryData = await request.json();
    const updatedEntry = await updateEntry(id, body);

    return NextResponse.json({ entry: updatedEntry });
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی ورودی' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const { id } = await params;
    const entry = await getEntryById(id);

    if (!entry) {
      return NextResponse.json({ error: 'ورودی یافت نشد' }, { status: 404 });
    }

    // Verify ownership
    if (entry.user_id !== user.id) {
      return NextResponse.json({ error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    await deleteEntry(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'خطا در حذف ورودی' },
      { status: 500 },
    );
  }
}
