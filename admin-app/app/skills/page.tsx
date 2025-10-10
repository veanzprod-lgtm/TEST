'use client';

import { useEffect, useState } from 'react';
import LogoutButton from '../../components/LogoutButton';
import { Toast } from '../../components/Toast';
import { Table } from '../../components/Table';
import { Field, FormActions } from '../../components/Form';
import type { Skill } from '../../lib/validate';

const emptySkill: Skill = { title: '', desc: '' };

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sha, setSha] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Skill>(emptySkill);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/content?path=skills.json');
        if (!response.ok) throw new Error('Chargement impossible');
        const payload = await response.json();
        if (!cancelled) {
          setSkills(payload.data as Skill[]);
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

  useEffect(() => {
    if (editingIndex === null) {
      setForm(emptySkill);
    } else {
      setForm(skills[editingIndex]);
    }
  }, [editingIndex, skills]);

  async function persist(nextSkills: Skill[], message: string) {
    setSubmitting(true);
    try {
      const response = await fetch('/api/content?path=skills.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: nextSkills, sha, message })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(payload.message);
      }
      const payload = await response.json();
      if (payload.sha) {
        setSha(payload.sha);
      }
      setSkills(nextSkills);
      setToast({ message: 'Compétences mises à jour', variant: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = [...skills];
    if (editingIndex === null) {
      next.push(form);
    } else {
      next[editingIndex] = form;
    }
    await persist(next, 'Mise à jour skills.json');
    setEditingIndex(null);
  }

  async function handleDelete(index: number) {
    if (!confirm('Supprimer cette compétence ?')) return;
    const next = skills.filter((_, i) => i !== index);
    await persist(next, 'Suppression skills.json');
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
        <h1>Compétences</h1>
        <LogoutButton />
      </header>

      <section style={{ marginTop: '2rem', display: 'grid', gap: '2rem' }}>
        <Table
          caption="Compétences"
          data={skills}
          columns={[
            { header: 'Titre', render: (skill) => skill.title },
            { header: 'Description', render: (skill) => skill.desc },
            {
              header: 'Actions',
              render: (_skill, index) => (
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
          empty={<p>Aucune compétence.</p>}
        />

        <section style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ marginTop: 0 }}>
            {editingIndex === null ? 'Ajouter une compétence' : 'Modifier la compétence'}
          </h2>
          <form onSubmit={handleSubmit}>
            <Field id="title" label="Titre">
              <input
                id="title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </Field>
            <Field id="desc" label="Description">
              <textarea
                id="desc"
                rows={3}
                value={form.desc}
                onChange={(event) => setForm((prev) => ({ ...prev, desc: event.target.value }))}
                required
              />
            </Field>
            <FormActions>
              {editingIndex !== null ? (
                <button type="button" onClick={() => setEditingIndex(null)}>
                  Annuler
                </button>
              ) : null}
              <button type="submit" disabled={submitting}>
                {submitting ? 'Sauvegarde…' : 'Enregistrer'}
              </button>
            </FormActions>
          </form>
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
