import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ message: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { code, productId } = await request.json().catch(() => ({}));
  if (!code || !productId) {
    return new NextResponse(
      JSON.stringify({ message: 'code and productId are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('validate_discount', {
    _code: code.trim(),
    _product_id: productId,
    _user_id: session.user.id,
  });

  if (error) {
    return new NextResponse(
      JSON.stringify({ message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return NextResponse.json(data);
}

