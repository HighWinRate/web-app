import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const admin = createAdminClient();
  const { data: file, error } = await admin
    .from('files')
    .select('path, mimetype, name, "isFree"')
    .eq('id', id)
    .single();

  if (error || !file) {
    return new NextResponse(
      JSON.stringify({ message: 'File not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const userId = session?.user?.id ?? null;
  const { data: canAccess } = await admin.rpc('can_access_file', {
    file_id: id,
    user_id: userId,
  });

  if (!canAccess) {
    return new NextResponse(
      JSON.stringify({ message: 'Access denied' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!file.path) {
    return new NextResponse(
      JSON.stringify({ message: 'File missing path' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { data: retrieved, error: storageError } = await admin.storage
    .from('files')
    .download(file.path);

  if (storageError || !retrieved) {
    return new NextResponse(
      JSON.stringify({ message: storageError?.message || 'Could not fetch file' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const arrayBuffer = await retrieved.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const dispos = request.nextUrl.searchParams.get('view') === 'true' ? 'inline' : 'attachment';
  const headers = {
    'Content-Type': file.mimetype || 'application/octet-stream',
    'Content-Length': body.length.toString(),
    'Content-Disposition': `${dispos}; filename="${file.name}"`,
  };

  return new NextResponse(body, { headers });
}

