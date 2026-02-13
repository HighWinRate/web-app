import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getUserEntryChecklists,
  createEntryChecklist,
  updateEntryChecklist,
  deleteEntryChecklist,
} from '@/lib/data/journal';
import type { CreateChecklistData, UpdateChecklistData } from '@/lib/types/journal';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const checklists = await getUserEntryChecklists(user.id);

    return NextResponse.json({ checklists });
  } catch (error) {
    console.error('Error fetching entry checklists:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت چک‌لیست‌ها' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const body: CreateChecklistData = await request.json();

    // Validation
    if (!body.name || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'نام و آیتم‌های چک‌لیست الزامی هستند' },
        { status: 400 },
      );
    }

    const checklist = await createEntryChecklist(user.id, body);

    return NextResponse.json({ checklist }, { status: 201 });
  } catch (error) {
    console.error('Error creating entry checklist:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد چک‌لیست' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'شناسه چک‌لیست الزامی است' },
        { status: 400 },
      );
    }

    const body: UpdateChecklistData = await request.json();
    const checklist = await updateEntryChecklist(id, body);

    return NextResponse.json({ checklist });
  } catch (error) {
    console.error('Error updating entry checklist:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی چک‌لیست' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'شناسه چک‌لیست الزامی است' },
        { status: 400 },
      );
    }

    await deleteEntryChecklist(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry checklist:', error);
    return NextResponse.json(
      { error: 'خطا در حذف چک‌لیست' },
      { status: 500 },
    );
  }
}
