import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { deleteCategory, updateCategory } from "@/features/taxonomy/repository";
import { requireAdmin, sameOrigin } from "@/lib/auth";
import { adminJson, bodyTooLargeError, conflictError, notFoundError, postIdSchema, readJson, RequestBodyTooLargeError, serverError, validationError } from "@/app/api/admin/posts/_shared";
const schema = z.object({ name: z.string().trim().min(1).max(100).optional(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(), description: z.string().max(500).optional() });
type C = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: C) { const u = requireAdmin(request); if (u) return u; if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const id = postIdSchema.safeParse((await context.params).id); if (!id.success) return validationError(id.error); let body: unknown; try { body = await readJson(request); } catch (e) { if (e instanceof RequestBodyTooLargeError) return bodyTooLargeError(); return validationError(e); } const p = schema.safeParse(body); if (!p.success) return validationError(p.error); try { const category = updateCategory(db, id.data, p.data); return category ? adminJson({ category }) : notFoundError(); } catch (e) { if (e instanceof Error && e.message.toLowerCase().includes("unique")) return conflictError("A category with this slug already exists"); return serverError(); } }
export async function DELETE(request: Request, context: C) { const u = requireAdmin(request); if (u) return u; if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const id = postIdSchema.safeParse((await context.params).id); if (!id.success) return validationError(id.error); try { return deleteCategory(db, id.data) ? adminJson({ deleted: true }) : notFoundError(); } catch { return serverError(); } }
