import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { deletePost, getPostById, updatePost } from "@/features/posts/repository";
import { postUpdateSchema } from "@/features/posts/validation";
import { requireAdmin, sameOrigin } from "@/lib/auth";
import { adminJson, bodyTooLargeError, conflictError, notFoundError, postIdSchema, readJson, RequestBodyTooLargeError, serverError, validationError } from "../_shared";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

async function getId(context: Context) {
  return postIdSchema.safeParse((await context.params).id);
}

export async function GET(request: Request, context: Context) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const id = await getId(context);
  if (!id.success) return validationError(id.error);
  try {
    const post = getPostById(db, id.data);
    return post ? adminJson({ post }) : notFoundError();
  } catch {
    return serverError();
  }
}

export async function PATCH(request: Request, context: Context) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = await getId(context);
  if (!id.success) return validationError(id.error);
  let body: unknown;
  try {
    body = await readJson(request);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return bodyTooLargeError();
  }
  const parsed = postUpdateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const post = updatePost(db, id.data, parsed.data);
    return post ? NextResponse.json({ post }) : notFoundError();
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unique")) return conflictError();
    return serverError();
  }
}

export const PUT = PATCH;

export async function DELETE(request: Request, context: Context) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = await getId(context);
  if (!id.success) return validationError(id.error);
  try {
    return deletePost(db, id.data) ? NextResponse.json({ deleted: true }) : notFoundError();
  } catch {
    return serverError();
  }
}
