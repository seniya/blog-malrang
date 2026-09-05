import { NextResponse } from "next/server";

import { db } from "@/db/client";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    // A successful connection is not enough: require Drizzle's migration ledger
    // so an uninitialised volume is not advertised as ready to the proxy.
    db.$client.prepare("SELECT 1").get();
    const migrationTable = db.$client
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'")
      .get() as { name?: string } | undefined;

    if (!migrationTable?.name) {
      return NextResponse.json({ status: "not_ready", reason: "migrations_pending" }, { status: 503 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "not_ready", reason: "database_unavailable" }, { status: 503 });
  }
}
