import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getAccountById,
  updateAccount,
  deleteAccount,
} from '@/lib/data/journal';
import type { UpdateAccountData } from '@/lib/types/journal';

export async function GET(
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
    const account = await getAccountById(id);

    if (!account) {
      return NextResponse.json({ error: 'حساب یافت نشد' }, { status: 404 });
    }

    // Verify ownership
    if (account.user_id !== user.id) {
      return NextResponse.json({ error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت حساب' },
      { status: 500 },
    );
  }
}

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
    const account = await getAccountById(id);

    if (!account) {
      return NextResponse.json({ error: 'حساب یافت نشد' }, { status: 404 });
    }

    // Verify ownership
    if (account.user_id !== user.id) {
      return NextResponse.json({ error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const body: UpdateAccountData = await request.json();
    const updatedAccount = await updateAccount(id, body);

    return NextResponse.json({ account: updatedAccount });
  } catch (error: any) {
    console.error('Error updating account:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'حسابی با این نام قبلا ایجاد شده است' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی حساب' },
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
    const account = await getAccountById(id);

    if (!account) {
      return NextResponse.json({ error: 'حساب یافت نشد' }, { status: 404 });
    }

    // Verify ownership
    if (account.user_id !== user.id) {
      return NextResponse.json({ error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    await deleteAccount(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'خطا در حذف حساب' },
      { status: 500 },
    );
  }
}
