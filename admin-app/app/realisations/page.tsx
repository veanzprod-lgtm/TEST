'use client';

import { useEffect, useMemo, useState } from 'react';
import LogoutButton from '../../components/LogoutButton';
import { Toast } from '../../components/Toast';
import { Table } from '../../components/Table';
import { ProjectForm } from '../../components/ProjectForm';
import type { Project } from '../../lib/validate';

export default function RealisationsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sha, setSha] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/content?path=realisations.json');
        if (!response.ok) throw new Error('Chargement impossible');
        const payload = await response.json();
        if (!cancelled) {
          setProjects(payload.data as Project[]);
          setSha(payload.sha);
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
  }, []);

  const editingProject = useMemo(() => {
    if (editingIndex === null) return undefined;
    return projects[editingIndex];
  }, [editingIndex, projects]);

  async function persist(nextProjects: Project[], commitMessage: string) {
    setSubmitting(true);
    try {
      const response = await fetch('/api/content?path=realisations.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: nextProjects, sha, message: commitMessage })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(payload.message);
      }
      const payload = await response.json();
      if (payload.sha) {
        setSha(payload.sha);
      }
      setProjects(nextProjects);
      setToast({ message: 'Réalisation sauvegardée', variant: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(project: Project) {
    const next = [...projects];
    if (editingIndex === null) {
      next.push(project);
    } else {
      next[editingIndex] = project;
    }
    await persist(next, 'Mise à jour realisations.json');
    setEditingIndex(null);
    setFormKey((value) => value + 1);
  }

  async function handleDelete(index: number) {
    if (!confirm('Supprimer cette réalisation ?')) return;
    const next = projects.filter((_, i) => i !== index);
    await persist(next, 'Suppression realisations.json');
  }

  if (loading) {
    return (
      <main>
        <p>Chargement…</p>
      </main>
    );
  }

  return (
    <main>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Réalisation</h1>
        <LogoutButton />
      </header>

      <section style={{ marginTop: '2rem', display: 'grid', gap: '2rem' }}>
        <div>
          <Table
            caption="Liste des réalisations"
            data={projects}
            columns={[
              { header: 'Titre', render: (project) => project.title },
              { header: 'Catégorie', render: (project) => project.category },
              { header: 'Année', render: (project) => project.year },
              {
                header: 'Actions',
                render: (_project, index) => (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => setEditingIndex(index)}>
                      Modifier
                    </button>
                    <button type="button" onClick={() => handleDelete(index)}>
                      Supprimer
                    </button>
                  </div>
                )
              }
            ]}
            empty={<p>Aucune réalisation pour le moment.</p>}
          />
        </div>

        <section style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ marginTop: 0 }}>
            {editingIndex === null ? 'Ajouter une réalisation' : 'Modifier la réalisation'}
          </h2>
          <ProjectForm
            key={formKey + (editingIndex ?? 0)}
            initial={editingProject}
            onSubmit={handleSubmit}
            onCancel=
              {editingIndex === null
                ? undefined
                : () => {
                    setEditingIndex(null);
                    setFormKey((value) => value + 1);
                  }}
            submitting={submitting}
          />
          {editingIndex === null ? (
            <button
              type="button"
              style={{ marginTop: '1rem' }}
              onClick={() => setFormKey((value) => value + 1)}
            >
              Réinitialiser le formulaire
            </button>
          ) : null}
        </section>
      </section>

      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant ?? 'success'}
        onClear={() => setToast(null)}
      />
    </main>
  );
}
