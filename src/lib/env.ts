import { z } from "zod";

export const CANONICAL_SITE_URL = "https://blog.malrang.net";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.literal(CANONICAL_SITE_URL).default(CANONICAL_SITE_URL),
  DATABASE_URL: z.string().min(1).default("./data/blog.db"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  DATABASE_URL: process.env.DATABASE_URL,
});
