import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { createTag, listTags } from "@/features/taxonomy/repository";
import { requireAdmin, sameOrigin } from "@/lib/auth";
import { adminJson, bodyTooLargeError, conflictError, readJson, RequestBodyTooLargeError, serverError, validationError } from "@/app/api/admin/posts/_shared";
const schema = z.object({ name: z.string().trim().min(1).max(100), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional() });
export async function GET(request: Request) { const u = requireAdmin(request); if (u) return u; return adminJson({ tags: listTags(db) }); }
export async function POST(request: Request) { const u = requireAdmin(request); if (u) return u; if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); let body: unknown; try { body = await readJson(request); } catch (e) { if (e instanceof RequestBodyTooLargeError) return bodyTooLargeError(); return validationError(e); } const p = schema.safeParse(body); if (!p.success) return validationError(p.error); try { return adminJson({ tag: createTag(db, p.data) }, { status: 201 }); } catch (e) { if (e instanceof Error && e.message.toLowerCase().includes("unique")) return conflictError("A tag with this slug already exists"); return serverError(); } }
