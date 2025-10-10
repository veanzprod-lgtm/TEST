'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toast } from '../../../components/Toast';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params?.get('redirectTo') ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      const payload = await response.json().catch(() => ({ message: 'Connexion impossible' }));
      setError(payload.message ?? 'Connexion impossible');
      setLoading(false);
    }
  }

  return (
    <main style={{ display: 'grid', placeItems: 'center' }}>
      <section style={{ width: '100%', maxWidth: 420 }}>
        <h1>Administration</h1>
        <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
          Connectez-vous pour modifier les contenus du site. Les identifiants sont fournis par
          l&apos;équipe Studio.
        </p>
        <form onSubmit={handleSubmit} aria-describedby={error ? 'login-error' : undefined}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
            />
          </div>
          <div>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
            />
          </div>
          {error ? (
            <p id="login-error" role="alert" style={{ color: '#ef4444' }}>
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          Besoin d&apos;aide ? Contactez <Link href="mailto:studio@example.com">studio@example.com</Link>
        </p>
        <Toast message={error} variant="error" onClear={() => setError(null)} />
      </section>
    </main>
  );
}
