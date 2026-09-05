import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

export const postIdSchema = z.string().uuid();
export const postListQuerySchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  search: z.string().trim().max(100).optional(),
});

export function validationError(error: unknown) {
  const issues = error instanceof ZodError ? error.issues : undefined;
  return NextResponse.json({ error: "Validation failed", issues }, { status: 400 });
}

export function notFoundError() {
  return NextResponse.json({ error: "Post not found" }, { status: 404 });
}

export function serverError() {
  return NextResponse.json({ error: "Unable to complete request" }, { status: 500 });
}

export function conflictError() {
  return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
}

export const MAX_POST_BODY_BYTES = 1_048_576;

export class RequestBodyTooLargeError extends Error {}

export function bodyTooLargeError() {
  return NextResponse.json({ error: "Request body is too large" }, { status: 413 });
}

export async function readJson(request: Request): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_POST_BODY_BYTES) throw new RequestBodyTooLargeError();
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_POST_BODY_BYTES) throw new RequestBodyTooLargeError();
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) throw error;
    throw new ZodError([{ code: "custom", path: [], message: "Request body must be valid JSON" }]);
  }
}
