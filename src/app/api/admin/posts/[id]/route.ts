import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { deletePost, getPostById, updatePost } from "@/features/posts/repository";
import { postUpdateSchema } from "@/features/posts/validation";
import { requireAdmin } from "@/lib/auth";
import { conflictError, notFoundError, postIdSchema, readJson, serverError, validationError } from "../_shared";

type Context = { params: Promise<{ id: string }> };

async function getId(context: Context) {
  return postIdSchema.safeParse((await context.params).id);
}

export async function GET(request: Request, context: Context) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const id = await getId(context);
  if (!id.success) return validationError(id.error);
  const post = getPostById(db, id.data);
  return post ? NextResponse.json({ post }) : notFoundError();
}

export async function PATCH(request: Request, context: Context) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const id = await getId(context);
  if (!id.success) return validationError(id.error);
  const parsed = postUpdateSchema.safeParse(await readJson(request).catch(() => undefined));
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
  const id = await getId(context);
  if (!id.success) return validationError(id.error);
  return deletePost(db, id.data) ? NextResponse.json({ deleted: true }) : notFoundError();
}
