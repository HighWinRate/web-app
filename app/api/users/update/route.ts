import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return new NextResponse(
      JSON.stringify({ message: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { first_name, last_name, email, password } = body;

  const authPayload: Record<string, string> = {};
  if (email) {
    authPayload.email = email;
  }
  if (password) {
    authPayload.password = password;
  }

  if (Object.keys(authPayload).length > 0) {
    const { error: authError } = await supabase.auth.updateUser(authPayload);
    if (authError) {
      return new NextResponse(
        JSON.stringify({ message: authError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  const admin = createAdminClient();
  const updatePayload: Record<string, string | null> = {
    first_name: first_name ?? null,
    last_name: last_name ?? null,
    email: email ?? null,
  };

  const { data: updatedUser, error: updateError } = await admin
    .from('users')
    .update(updatePayload)
    .eq('id', session.user.id)
    .select('*')
    .single();

  if (updateError) {
    return new NextResponse(
      JSON.stringify({ message: updateError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return NextResponse.json(updatedUser);
}

