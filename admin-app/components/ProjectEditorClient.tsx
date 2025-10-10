'use client';

import { useEffect, useState } from 'react';
import { Toast } from './Toast';
import { ProjectForm } from './ProjectForm';
import type { Project } from '../lib/validate';

export function ProjectEditorClient({ slug }: { slug: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sha, setSha] = useState('');
  const [current, setCurrent] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/content?path=realisations.json');
        if (!response.ok) throw new Error('Chargement impossible');
        const payload = await response.json();
        const data = payload.data as Project[];
        const match = data.find((project) => project.slug === slug);
        if (!match) {
          throw new Error('Projet introuvable');
        }
        if (!cancelled) {
          setProjects(data);
          setSha(payload.sha);
          setCurrent(match ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setToast({ message: (error as Error).message, variant: 'error' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleSubmit(project: Project) {
    const next = projects.map((item) => (item.slug === slug ? project : item));
    setSubmitting(true);
    try {
      const response = await fetch('/api/content?path=realisations.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: next, sha, message: `Mise à jour ${slug}` })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(payload.message);
      }
      const payload = await response.json();
      if (payload.sha) {
        setSha(payload.sha);
      }
      setProjects(next);
      setCurrent(project);
      setToast({ message: 'Projet mis à jour', variant: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Chargement…</p>;
  }

  if (!current) {
    return (
      <section style={{ marginTop: '2rem' }}>
        <p>Projet introuvable.</p>
        <Toast
          message={toast?.message ?? null}
          variant={toast?.variant ?? 'error'}
          onClear={() => setToast(null)}
        />
      </section>
    );
  }

  return (
    <section style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '1rem' }}>
      <ProjectForm initial={current} onSubmit={handleSubmit} submitting={submitting} />
      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant ?? 'success'}
        onClear={() => setToast(null)}
      />
    </section>
  );
}
