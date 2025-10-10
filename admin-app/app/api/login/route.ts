import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type LoginBody = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<LoginBody>;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ message: 'Configuration manquante' }, { status: 500 });
  }

  if (body.email !== adminEmail || body.password !== adminPassword) {
    return NextResponse.json({ message: 'Identifiants invalides' }, { status: 401 });
  }

  cookies().set('admin', adminEmail, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8
  });

  return NextResponse.json({ ok: true });
}
