import { z } from "zod";

export const postStatusSchema = z.enum(["draft", "published"]);

export const postInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  excerpt: z.string().trim().max(500).default(""),
  content: z.string().min(1),
  coverImageUrl: z.string().url().nullable().optional(),
  status: postStatusSchema.default("draft"),
  publishedAt: z.coerce.date().nullable().optional(),
});

export const postUpdateSchema = postInputSchema.partial();

export type PostInput = z.input<typeof postInputSchema>;
export type PostUpdate = z.infer<typeof postUpdateSchema>;
