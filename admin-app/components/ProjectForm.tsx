'use client';

import { useEffect, useState } from 'react';
import { Field, FormActions } from './Form';
import type { Project } from '../lib/validate';

const emptyProject: Project = {
  title: '',
  slug: '',
  category: '',
  year: new Date().getFullYear(),
  client: '',
  cover: '',
  videoUrl: '',
  context: '',
  credits: [],
  images: []
};

function cloneProject(project: Project): Project {
  return {
    ...project,
    credits: [...project.credits],
    images: [...project.images]
  };
}

type ProjectFormProps = {
  initial?: Project;
  onSubmit: (project: Project) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
};

export function ProjectForm({ initial, onSubmit, onCancel, submitting }: ProjectFormProps) {
  const [project, setProject] = useState<Project>(
    initial ? cloneProject(initial) : cloneProject(emptyProject)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setProject(initial ? cloneProject(initial) : cloneProject(emptyProject));
  }, [initial]);

  function updateField<K extends keyof Project>(key: K, value: Project[K]) {
    setProject((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    try {
      await onSubmit(project);
    } catch (error) {
      setErrors({ form: (error as Error).message });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field id="title" label="Titre">
        <input
          id="title"
          value={project.title}
          onChange={(event) => updateField('title', event.target.value)}
          required
        />
      </Field>
      <Field id="slug" label="Slug" description="Utilisé pour l'URL (kebab-case)">
        <input
          id="slug"
          value={project.slug}
          onChange={(event) => updateField('slug', event.target.value)}
          required
        />
      </Field>
      <Field id="category" label="Catégorie">
        <input
          id="category"
          value={project.category}
          onChange={(event) => updateField('category', event.target.value)}
          required
        />
      </Field>
      <Field id="year" label="Année">
        <input
          id="year"
          type="number"
          min="1900"
          max="2100"
          value={project.year}
          onChange={(event) => updateField('year', Number(event.target.value))}
          required
        />
      </Field>
      <Field id="client" label="Client">
        <input
          id="client"
          value={project.client}
          onChange={(event) => updateField('client', event.target.value)}
          required
        />
      </Field>
      <Field id="cover" label="Image de couverture (URL)">
        <input
          id="cover"
          type="url"
          value={project.cover}
          onChange={(event) => updateField('cover', event.target.value)}
          required
        />
      </Field>
      <Field id="videoUrl" label="URL de la vidéo">
        <input
          id="videoUrl"
          type="url"
          value={project.videoUrl}
          onChange={(event) => updateField('videoUrl', event.target.value)}
          required
        />
      </Field>
      <Field id="context" label="Contexte">
        <textarea
          id="context"
          rows={4}
          value={project.context}
          onChange={(event) => updateField('context', event.target.value)}
          required
        />
      </Field>

      <fieldset>
        <legend>Crédits</legend>
        {project.credits.map((credit, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <Field id={`credit-${index}`} label={`Crédit ${index + 1}`}>
              <input
                id={`credit-${index}`}
                value={credit}
                onChange={(event) => {
                  const value = event.target.value;
                  setProject((prev) => {
                    const next = [...prev.credits];
                    next[index] = value;
                    return { ...prev, credits: next };
                  });
                }}
              />
            </Field>
            <button
              type="button"
              onClick={() =>
                setProject((prev) => ({
                  ...prev,
                  credits: prev.credits.filter((_, i) => i !== index)
                }))
              }
            >
              Retirer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setProject((prev) => ({ ...prev, credits: [...prev.credits, ''] }))}
        >
          Ajouter un crédit
        </button>
      </fieldset>

      <fieldset>
        <legend>Images</legend>
        {project.images.map((image, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <Field id={`image-${index}`} label={`Image ${index + 1}`}>
              <input
                id={`image-${index}`}
                type="url"
                value={image}
                onChange={(event) => {
                  const value = event.target.value;
                  setProject((prev) => {
                    const next = [...prev.images];
                    next[index] = value;
                    return { ...prev, images: next };
                  });
                }}
              />
            </Field>
            <button
              type="button"
              onClick={() =>
                setProject((prev) => ({
                  ...prev,
                  images: prev.images.filter((_, i) => i !== index)
                }))
              }
            >
              Retirer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setProject((prev) => ({ ...prev, images: [...prev.images, ''] }))}
        >
          Ajouter une image
        </button>
      </fieldset>

      {errors.form ? (
        <p role="alert" style={{ color: '#ef4444' }}>
          {errors.form}
        </p>
      ) : null}

      <FormActions>
        {onCancel ? (
          <button type="button" onClick={onCancel}>
            Annuler
          </button>
        ) : null}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sauvegarde…' : 'Enregistrer'}
        </button>
      </FormActions>
    </form>
  );
}

