import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { createPost, listAllPosts } from "@/features/posts/repository";
import { postInputSchema } from "@/features/posts/validation";
import { requireAdmin } from "@/lib/auth";
import { conflictError, postListQuerySchema, readJson, serverError, validationError } from "./_shared";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const parsed = postListQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return validationError(parsed.error);
  return NextResponse.json({ posts: listAllPosts(db, parsed.data) });
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const parsed = postInputSchema.safeParse(await readJson(request).catch(() => undefined));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const post = createPost(db, parsed.data);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unique")) return conflictError();
    return serverError();
  }
}
