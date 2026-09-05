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

export const postUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case")
    .optional(),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().min(1).optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  status: postStatusSchema.optional(),
  publishedAt: z.coerce.date().nullable().optional(),
});

export type PostInput = z.input<typeof postInputSchema>;
export type PostUpdate = z.infer<typeof postUpdateSchema>;
