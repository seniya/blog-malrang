import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { createPost, listAllPosts } from "@/features/posts/repository";
import { postInputSchema } from "@/features/posts/validation";
import { requireAdmin, sameOrigin } from "@/lib/auth";
import { adminJson, bodyTooLargeError, conflictError, postListQuerySchema, readJson, RequestBodyTooLargeError, serverError, validationError } from "./_shared";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const parsed = postListQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return validationError(parsed.error);
  try {
    return adminJson({ posts: listAllPosts(db, parsed.data) });
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: unknown;
  try {
    body = await readJson(request);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return bodyTooLargeError();
  }
  const parsed = postInputSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const post = createPost(db, parsed.data);
    return adminJson({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid")) return validationError(error);
    if (error instanceof Error && error.message.toLowerCase().includes("unique")) return conflictError();
    return serverError();
  }
}
