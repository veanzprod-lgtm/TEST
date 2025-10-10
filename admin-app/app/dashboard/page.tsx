import Link from 'next/link';
import { cookies } from 'next/headers';
import LogoutButton from '../../components/LogoutButton';

const links = [
  { href: '/site', label: 'Site' },
  { href: '/realisations', label: 'Réalisations' },
  { href: '/team', label: 'Équipe' },
  { href: '/skills', label: 'Compétences' }
];

export default function DashboardPage() {
  const session = cookies().get('admin');

  return (
    <main>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Tableau de bord</h1>
          <p style={{ color: '#475569' }}>Connecté en tant que {session?.value}</p>
        </div>
        <LogoutButton />
      </header>

      <section style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid rgba(15,23,42,0.08)',
              background: 'white',
              textDecoration: 'none',
              display: 'block',
              transition: 'transform 200ms ease'
            }}
          >
            <h2 style={{ marginTop: 0 }}>{link.label}</h2>
            <p style={{ color: '#64748b' }}>Gérer les contenus {link.label.toLowerCase()}.</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
