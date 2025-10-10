import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '../../../lib/github';
import { validateContent } from '../../../lib/validate';

function ensureAuth() {
  const session = cookies().get('admin');
  if (!session) {
    throw new Error('Unauthenticated');
  }
  return session.value;
}

export async function GET(request: Request) {
  try {
    ensureAuth();
  } catch (error) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ message: 'Paramètre path manquant' }, { status: 400 });
  }

  try {
    const { data, sha } = await readJsonFile(path);
    return NextResponse.json({ data, sha });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ message: 'Paramètre path manquant' }, { status: 400 });
  }

  let adminEmail: string;
  try {
    adminEmail = ensureAuth();
  } catch (error) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ message: 'Payload invalide' }, { status: 400 });
  }

  const { data, sha, message } = payload as { data: unknown; sha: string; message?: string };
  if (!sha) {
    return NextResponse.json({ message: 'SHA manquant' }, { status: 400 });
  }

  try {
    const validated = validateContent(path, data);
    const newSha = await writeJsonFile(
      path,
      validated,
      sha,
      message ?? `Update ${path} via admin (${adminEmail})`
    );
    return NextResponse.json({ ok: true, sha: newSha });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.name === 'ZodError' ? 400 : 500;
      return NextResponse.json({ message: error.message }, { status });
    }
    return NextResponse.json({ message: 'Erreur inconnue' }, { status: 500 });
  }
}
