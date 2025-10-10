'use client';

import { useEffect, useState } from 'react';
import LogoutButton from '../../components/LogoutButton';
import { Field, FormActions } from '../../components/Form';
import { Toast } from '../../components/Toast';
import type { Site } from '../../lib/validate';

const emptySite: Site = {
  name: '',
  baseline: '',
  email: '',
  phone: '',
  offices: [],
  socials: [],
  clients: []
};

export default function SitePage() {
  const [site, setSite] = useState<Site>(emptySite);
  const [sha, setSha] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/content?path=site.json');
        if (!response.ok) throw new Error('Chargement impossible');
        const payload = await response.json();
        if (!cancelled) {
          setSite(payload.data as Site);
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

  function updateField<K extends keyof Site>(key: K, value: Site[K]) {
    setSite((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/content?path=site.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: site, sha, message: 'Mise à jour site.json' })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(payload.message);
      }
      const payload = await response.json();
      if (payload.sha) {
        setSha(payload.sha);
      }
      setToast({ message: 'Contenu sauvegardé', variant: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, variant: 'error' });
    } finally {
      setSaving(false);
    }
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
        <h1>Site</h1>
        <LogoutButton />
      </header>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <Field id="name" label="Nom">
          <input
            id="name"
            value={site.name}
            onChange={(event) => updateField('name', event.target.value)}
            required
          />
        </Field>
        <Field id="baseline" label="Baseline">
          <input
            id="baseline"
            value={site.baseline}
            onChange={(event) => updateField('baseline', event.target.value)}
            required
          />
        </Field>
        <Field id="email" label="Email">
          <input
            id="email"
            type="email"
            value={site.email}
            onChange={(event) => updateField('email', event.target.value)}
            required
          />
        </Field>
        <Field id="phone" label="Téléphone">
          <input
            id="phone"
            value={site.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            required
          />
        </Field>

        <fieldset>
          <legend>Bureaux</legend>
          {site.offices.map((office, index) => (
            <div key={index} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
              <Field id={`office-city-${index}`} label="Ville">
                <input
                  id={`office-city-${index}`}
                  value={office.city}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSite((prev) => {
                      const next = [...prev.offices];
                      next[index] = { ...next[index], city: value };
                      return { ...prev, offices: next };
                    });
                  }}
                />
              </Field>
              <Field id={`office-address-${index}`} label="Adresse">
                <textarea
                  id={`office-address-${index}`}
                  value={office.address}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSite((prev) => {
                      const next = [...prev.offices];
                      next[index] = { ...next[index], address: value };
                      return { ...prev, offices: next };
                    });
                  }}
                  rows={3}
                />
              </Field>
              <button
                type="button"
                onClick={() => {
                  setSite((prev) => ({
                    ...prev,
                    offices: prev.offices.filter((_, i) => i !== index)
                  }));
                }}
              >
                Supprimer ce bureau
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setSite((prev) => ({
                ...prev,
                offices: [...prev.offices, { city: '', address: '' }]
              }))
            }
          >
            Ajouter un bureau
          </button>
        </fieldset>

        <fieldset>
          <legend>Réseaux sociaux</legend>
          {site.socials.map((social, index) => (
            <div key={index} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
              <Field id={`social-name-${index}`} label="Nom">
                <input
                  id={`social-name-${index}`}
                  value={social.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSite((prev) => {
                      const next = [...prev.socials];
                      next[index] = { ...next[index], name: value };
                      return { ...prev, socials: next };
                    });
                  }}
                />
              </Field>
              <Field id={`social-url-${index}`} label="URL">
                <input
                  id={`social-url-${index}`}
                  value={social.url}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSite((prev) => {
                      const next = [...prev.socials];
                      next[index] = { ...next[index], url: value };
                      return { ...prev, socials: next };
                    });
                  }}
                  type="url"
                />
              </Field>
              <button
                type="button"
                onClick={() =>
                  setSite((prev) => ({
                    ...prev,
                    socials: prev.socials.filter((_, i) => i !== index)
                  }))
                }
              >
                Supprimer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setSite((prev) => ({
                ...prev,
                socials: [...prev.socials, { name: '', url: '' }]
              }))
            }
          >
            Ajouter un réseau
          </button>
        </fieldset>

        <fieldset>
          <legend>Clients</legend>
          {site.clients.map((client, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <Field id={`client-${index}`} label={`Client ${index + 1}`}>
                <input
                  id={`client-${index}`}
                  value={client}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSite((prev) => {
                      const next = [...prev.clients];
                      next[index] = value;
                      return { ...prev, clients: next };
                    });
                  }}
                />
              </Field>
              <button
                type="button"
                onClick={() =>
                  setSite((prev) => ({
                    ...prev,
                    clients: prev.clients.filter((_, i) => i !== index)
                  }))
                }
              >
                Supprimer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setSite((prev) => ({
                ...prev,
                clients: [...prev.clients, '']
              }))
            }
          >
            Ajouter un client
          </button>
        </fieldset>

        <FormActions>
          <button type="submit" disabled={saving}>
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </FormActions>
      </form>
      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant ?? 'success'}
        onClear={() => setToast(null)}
      />
    </main>
  );
}
