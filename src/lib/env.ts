import { z } from "zod";

export const CANONICAL_SITE_URL = "https://blog.malrang.net";
const developmentSecret = "local-development-session-secret-change-me";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.literal(CANONICAL_SITE_URL).default(CANONICAL_SITE_URL),
  DATABASE_URL: z.string().min(1).default("./data/blog.db"),
  SESSION_SECRET: z.string().min(32).optional(),
  ADMIN_USERNAME: z.string().min(1).optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
});

const parsed = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
});
if (process.env.NODE_ENV === "production" && !parsed.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set to a random 32+ character value in production");
}

export const env = { ...parsed, SESSION_SECRET: parsed.SESSION_SECRET ?? developmentSecret };
