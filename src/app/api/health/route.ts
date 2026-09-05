import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { isDatabaseReady } from "@/app/api/health/readiness";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    if (!isDatabaseReady(db.$client)) {
      return NextResponse.json({ status: "not_ready", reason: "migrations_pending" }, { status: 503 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "not_ready", reason: "database_unavailable" }, { status: 503 });
  }
}
