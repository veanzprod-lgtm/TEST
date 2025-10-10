import { describe, expect, it } from 'vitest';
import { ProjectSchema, SiteSchema } from '../../lib/validate';

describe('SiteSchema', () => {
  it('rejects invalid email', () => {
    expect(() =>
      SiteSchema.parse({
        name: 'Studio',
        baseline: 'Baseline',
        email: 'invalid-email',
        phone: '+33 1 23 45 67 89',
        offices: [{ city: 'Paris', address: '1 rue de Paris' }],
        socials: [{ name: 'LinkedIn', url: 'https://linkedin.com' }],
        clients: ['Client']
      })
    ).toThrowErrorMatchingInlineSnapshot(`"Invalid email"`);
  });
});

describe('ProjectSchema', () => {
  it('rejects slug with uppercase letters', () => {
    expect(() =>
      ProjectSchema.parse({
        title: 'Projet',
        slug: 'SlugInvalide',
        category: 'Catégorie',
        year: 2024,
        client: 'Client',
        cover: 'https://example.com/cover.webp',
        videoUrl: 'https://example.com/video',
        context: 'Contexte',
        credits: ['Nom'],
        images: ['https://example.com/image.webp']
      })
    ).toThrowErrorMatchingInlineSnapshot(`"Invalid input"`);
  });
});
