import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getUserExitChecklists,
  createExitChecklist,
  updateExitChecklist,
  deleteExitChecklist,
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

    const checklists = await getUserExitChecklists(user.id);

    return NextResponse.json({ checklists });
  } catch (error) {
    console.error('Error fetching exit checklists:', error);
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

    const checklist = await createExitChecklist(user.id, body);

    return NextResponse.json({ checklist }, { status: 201 });
  } catch (error) {
    console.error('Error creating exit checklist:', error);
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
    const checklist = await updateExitChecklist(id, body);

    return NextResponse.json({ checklist });
  } catch (error) {
    console.error('Error updating exit checklist:', error);
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

    await deleteExitChecklist(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exit checklist:', error);
    return NextResponse.json(
      { error: 'خطا در حذف چک‌لیست' },
      { status: 500 },
    );
  }
}
