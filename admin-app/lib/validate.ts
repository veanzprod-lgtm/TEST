import { z } from 'zod';

export const SiteSchema = z.object({
  name: z.string(),
  baseline: z.string(),
  email: z.string().email(),
  phone: z.string(),
  offices: z.array(z.object({ city: z.string(), address: z.string() })),
  socials: z.array(z.object({ name: z.string(), url: z.string().url() })),
  clients: z.array(z.string())
});

export const ProjectSchema = z.object({
  title: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.string(),
  year: z.number().int(),
  client: z.string(),
  cover: z.string().url(),
  videoUrl: z.string().url(),
  context: z.string(),
  credits: z.array(z.string()),
  images: z.array(z.string().url())
});

export const ProjectsSchema = z.array(ProjectSchema);

export const MemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  photo: z.string().url()
});

export const TeamSchema = z.array(MemberSchema);

export const SkillSchema = z.object({ title: z.string(), desc: z.string() });

export const SkillsSchema = z.array(SkillSchema);

export type Site = z.infer<typeof SiteSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type Skill = z.infer<typeof SkillSchema>;

export function validateContent(path: string, data: unknown) {
  switch (path) {
    case 'site.json':
      return SiteSchema.parse(data);
    case 'realisations.json':
      return ProjectsSchema.parse(data);
    case 'team.json':
      return TeamSchema.parse(data);
    case 'skills.json':
      return SkillsSchema.parse(data);
    default:
      throw new Error(`Validation non définie pour ${path}`);
  }
}
