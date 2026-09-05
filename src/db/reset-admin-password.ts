import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { env } from "@/lib/env";
import { hashPassword } from "@/lib/password";

export async function resetAdminPassword(
  database = db,
  username = env.ADMIN_USERNAME,
  password = env.ADMIN_PASSWORD,
): Promise<boolean> {
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required for admin password reset");
  }

  const result = await database
    .update(users)
    .set({ passwordHash: await hashPassword(password), updatedAt: new Date() })
    .where(eq(users.username, username))
    .returning({ id: users.id })
    .all();

  return result.length === 1;
}

if (process.argv[1]?.endsWith("reset-admin-password.ts")) {
  resetAdminPassword()
    .then((updated) => {
      if (!updated) throw new Error("Admin account not found");
      console.log("Admin password updated.");
      db.close();
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : "Admin password reset failed");
      db.close();
      process.exitCode = 1;
    });
}
