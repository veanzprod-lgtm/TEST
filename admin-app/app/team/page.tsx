'use client';

import { useEffect, useState } from 'react';
import LogoutButton from '../../components/LogoutButton';
import { Toast } from '../../components/Toast';
import { Table } from '../../components/Table';
import { Field, FormActions } from '../../components/Form';
import type { Member } from '../../lib/validate';

const emptyMember: Member = {
  name: '',
  role: '',
  bio: '',
  photo: ''
};

export default function TeamPage() {
  const [team, setTeam] = useState<Member[]>([]);
  const [sha, setSha] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Member>(emptyMember);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/content?path=team.json');
        if (!response.ok) throw new Error('Chargement impossible');
        const payload = await response.json();
        if (!cancelled) {
          setTeam(payload.data as Member[]);
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
      setForm(emptyMember);
    } else {
      setForm(team[editingIndex]);
    }
  }, [editingIndex, team]);

  async function persist(nextTeam: Member[], message: string) {
    setSubmitting(true);
    try {
      const response = await fetch('/api/content?path=team.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: nextTeam, sha, message })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(payload.message);
      }
      const payload = await response.json();
      if (payload.sha) {
        setSha(payload.sha);
      }
      setTeam(nextTeam);
      setToast({ message: 'Équipe mise à jour', variant: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = [...team];
    if (editingIndex === null) {
      next.push(form);
    } else {
      next[editingIndex] = form;
    }
    await persist(next, 'Mise à jour team.json');
    setEditingIndex(null);
  }

  async function handleDelete(index: number) {
    if (!confirm('Supprimer ce membre ?')) return;
    const next = team.filter((_, i) => i !== index);
    await persist(next, 'Suppression team.json');
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
        <h1>Équipe</h1>
        <LogoutButton />
      </header>

      <section style={{ marginTop: '2rem', display: 'grid', gap: '2rem' }}>
        <Table
          caption="Membres de l'équipe"
          data={team}
          columns={[
            { header: 'Nom', render: (member) => member.name },
            { header: 'Rôle', render: (member) => member.role },
            {
              header: 'Actions',
              render: (_member, index) => (
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
          empty={<p>Aucun membre.</p>}
        />

        <section style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ marginTop: 0 }}>
            {editingIndex === null ? 'Ajouter un membre' : 'Modifier un membre'}
          </h2>
          <form onSubmit={handleSubmit}>
            <Field id="name" label="Nom">
              <input
                id="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </Field>
            <Field id="role" label="Rôle">
              <input
                id="role"
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                required
              />
            </Field>
            <Field id="bio" label="Bio">
              <textarea
                id="bio"
                rows={3}
                value={form.bio}
                onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                required
              />
            </Field>
            <Field id="photo" label="Photo (URL)">
              <input
                id="photo"
                type="url"
                value={form.photo}
                onChange={(event) => setForm((prev) => ({ ...prev, photo: event.target.value }))}
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
