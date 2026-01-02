const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function normalizePath(path: string) {
  return path.replace(/^\/*/u, '');
}

export function getPublicStorageUrl(bucket: string, path?: string | null) {
  if (!STORAGE_URL || !path) {
    return null;
  }

  const baseUrl = STORAGE_URL.replace(/\/$/, '');
  const objectPath = normalizePath(path);
  return `${baseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
}

