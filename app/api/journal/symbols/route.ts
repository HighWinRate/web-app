import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getUserSymbols,
  createSymbol,
  deleteSymbol,
} from '@/lib/data/journal';
import type { CreateSymbolData } from '@/lib/types/journal';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const symbols = await getUserSymbols(user.id);

    return NextResponse.json({ symbols });
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سمبل‌ها' },
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

    const body: CreateSymbolData = await request.json();

    // Validation
    if (!body.name) {
      return NextResponse.json(
        { error: 'نام سمبل الزامی است' },
        { status: 400 },
      );
    }

    const symbol = await createSymbol(user.id, body);

    return NextResponse.json({ symbol }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating symbol:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'این سمبل قبلا ایجاد شده است' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'خطا در ایجاد سمبل' },
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
        { error: 'شناسه سمبل الزامی است' },
        { status: 400 },
      );
    }

    await deleteSymbol(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting symbol:', error);
    return NextResponse.json(
      { error: 'خطا در حذف سمبل' },
      { status: 500 },
    );
  }
}
