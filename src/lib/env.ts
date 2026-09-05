import { z } from "zod";

export const CANONICAL_SITE_URL = "https://blog.malrang.net";

const obviousSecretPlaceholders = [
  "replace-with-a-random-32-character-secret",
  "change-me",
  "changeme",
  "development",
  "secret",
  "password",
];

export function validateSessionSecret(value: string | undefined): string {
  if (!value) throw new Error("SESSION_SECRET must be set to a random 32+ character value");
  if (value.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  const lower = value.toLowerCase();
  if (obviousSecretPlaceholders.some((placeholder) => lower.includes(placeholder))) {
    throw new Error("SESSION_SECRET must not contain an obvious placeholder");
  }
  return value;
}

const optionalEnvString = z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional());
const optionalAdminPassword = z.preprocess((value) => (value === "" ? undefined : value), z.string().min(8).optional());

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.literal(CANONICAL_SITE_URL).default(CANONICAL_SITE_URL),
  DATABASE_URL: z.string().min(1).default("./data/blog.db"),
  SESSION_SECRET: z.string().optional(),
  ADMIN_USERNAME: optionalEnvString,
  ADMIN_PASSWORD: optionalAdminPassword,
});

const parsed = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
});
export const env = {
  ...parsed,
  SESSION_SECRET: validateSessionSecret(parsed.SESSION_SECRET),
};
