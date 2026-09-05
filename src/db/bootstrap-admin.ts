import type { Db } from "@/db/client";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { env } from "@/lib/env";
import { hashPassword } from "@/lib/password";

export async function bootstrapAdmin(database: Db = db, username = env.ADMIN_USERNAME, password = env.ADMIN_PASSWORD): Promise<boolean> {
  if (!username || !password) throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required for admin bootstrap");
  const result = await database.insert(users).values({ username, passwordHash: await hashPassword(password) }).onConflictDoNothing({ target: users.username }).run();
  return result.changes > 0;
}

if (process.argv[1]?.endsWith("bootstrap-admin.ts")) {
  bootstrapAdmin().then((created) => { if (created) console.log("Admin account created."); else console.log("Admin account already exists."); db.close(); }).catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Admin bootstrap failed"); db.close(); process.exitCode = 1; });
}
