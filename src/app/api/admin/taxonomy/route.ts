import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { createCategory, createTag, listCategories, listTags } from "@/features/taxonomy/repository";
import { requireAdmin, sameOrigin } from "@/lib/auth";
import { adminJson, bodyTooLargeError, conflictError, readJson, RequestBodyTooLargeError, serverError, validationError } from "@/app/api/admin/posts/_shared";

export const dynamic = "force-dynamic";
const categorySchema = z.object({ name: z.string().trim().min(1).max(100), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(), description: z.string().max(500).optional() });
const tagSchema = z.object({ name: z.string().trim().min(1).max(100), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional() });

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request); if (unauthorized) return unauthorized;
  try { return adminJson({ categories: listCategories(db), tags: listTags(db) }); } catch { return serverError(); }
}
export async function POST(request: Request) {
  const unauthorized = requireAdmin(request); if (unauthorized) return unauthorized;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: unknown; try { body = await readJson(request); } catch (error) { if (error instanceof RequestBodyTooLargeError) return bodyTooLargeError(); return validationError(error); }
  const parsed = z.object({ type: z.enum(["category", "tag"]), data: z.unknown() }).safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  const data = (parsed.data.type === "category" ? categorySchema : tagSchema).safeParse(parsed.data.data);
  if (!data.success) return validationError(data.error);
  try { const item = parsed.data.type === "category" ? createCategory(db, data.data) : createTag(db, data.data); return adminJson({ item }, { status: 201 }); } catch (error) { if (error instanceof Error && error.message.toLowerCase().includes("unique")) return conflictError("A taxonomy item with this slug already exists"); return serverError(); }
}
