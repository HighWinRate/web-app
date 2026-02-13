import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getUserSetups,
  createSetup,
  updateSetup,
  deleteSetup,
} from '@/lib/data/journal';
import type { CreateSetupData } from '@/lib/types/journal';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const setups = await getUserSetups(user.id);

    return NextResponse.json({ setups });
  } catch (error) {
    console.error('Error fetching setups:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت ستاپ‌ها' },
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

    const body: CreateSetupData = await request.json();

    // Validation
    if (!body.name) {
      return NextResponse.json(
        { error: 'نام ستاپ الزامی است' },
        { status: 400 },
      );
    }

    const setup = await createSetup(user.id, body);

    return NextResponse.json({ setup }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating setup:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'این ستاپ قبلا ایجاد شده است' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'خطا در ایجاد ستاپ' },
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
        { error: 'شناسه ستاپ الزامی است' },
        { status: 400 },
      );
    }

    const body: CreateSetupData = await request.json();
    const setup = await updateSetup(id, body);

    return NextResponse.json({ setup });
  } catch (error: any) {
    console.error('Error updating setup:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'این ستاپ قبلا ایجاد شده است' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی ستاپ' },
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
        { error: 'شناسه ستاپ الزامی است' },
        { status: 400 },
      );
    }

    await deleteSetup(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting setup:', error);
    return NextResponse.json(
      { error: 'خطا در حذف ستاپ' },
      { status: 500 },
    );
  }
}
