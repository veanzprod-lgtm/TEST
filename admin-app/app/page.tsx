import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  const cookieStore = cookies();
  const adminCookie = cookieStore.get('admin');

  if (adminCookie?.value) {
    redirect('/dashboard');
  }

  redirect('/login');
}
