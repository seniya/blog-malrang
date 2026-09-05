"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type { Post } from "@/db/schema";
import { Markdown } from "@/components/posts/markdown";
import { useAdminTaxonomy, useCreatePost, useCreateTaxonomy, useUpdatePost } from "@/features/posts/admin-hooks";

const formSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력하세요").max(200),
  slug: z.string().trim().min(1, "슬러그를 입력하세요").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "소문자 kebab-case만 사용할 수 있습니다"),
  excerpt: z.string().max(500),
  content: z.string().min(1, "본문을 입력하세요"),
  coverImageUrl: z.string().url("올바른 URL을 입력하세요").or(z.literal("")),
  status: z.enum(["draft", "published"]),
  categoryIds: z.array(z.string().uuid()),
  tagIds: z.array(z.string().uuid()),
});
type FormValues = z.infer<typeof formSchema>;

function defaults(post?: Post): FormValues {
  return { title: post?.title ?? "", slug: post?.slug ?? "", excerpt: post?.excerpt ?? "", content: post?.content ?? "", coverImageUrl: post?.coverImageUrl ?? "", status: post?.status ?? "draft", categoryIds: (post as Post & { categoryIds?: string[] })?.categoryIds ?? [], tagIds: (post as Post & { tagIds?: string[] })?.tagIds ?? [] };
}

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const create = useCreatePost();
  const update = useUpdatePost(post?.id ?? "");
  const mutation = post ? update : create;
  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: defaults(post) });
  const taxonomy = useAdminTaxonomy();
  const createTaxonomy = useCreateTaxonomy();
  const content = useWatch({ control, name: "content" });
  const selectedTags = useWatch({ control, name: "tagIds" });
  const submit = handleSubmit(async (values) => {
    await mutation.mutateAsync({ ...values, coverImageUrl: values.coverImageUrl || null });
    router.push("/admin/posts");
    router.refresh();
  });
  return <form onSubmit={submit} className="space-y-5">
    <div className="grid gap-4 md:grid-cols-2">
      <label>제목<input {...register("title")} className="mt-1 w-full rounded border p-2" />{errors.title && <small className="text-red-600">{errors.title.message}</small>}</label>
      <label>슬러그<input {...register("slug")} className="mt-1 w-full rounded border p-2" />{errors.slug && <small className="text-red-600">{errors.slug.message}</small>}</label>
    </div>
    <label className="block">요약<textarea {...register("excerpt")} rows={2} className="mt-1 w-full rounded border p-2" /></label>
    <label className="block">본문 (Markdown)<textarea {...register("content")} rows={18} className="mt-1 w-full rounded border p-2 font-mono" />{errors.content && <small className="text-red-600">{errors.content.message}</small>}</label>
    <section aria-label="Markdown preview" className="rounded border p-4"><h2 className="mb-2 font-semibold">미리보기</h2><Markdown content={content || "미리보기할 내용이 없습니다."} /></section>
    <label className="block">커버 이미지 URL (선택)<input {...register("coverImageUrl")} className="mt-1 w-full rounded border p-2" />{errors.coverImageUrl && <small className="text-red-600">{errors.coverImageUrl.message}</small>}</label>
    <div className="grid gap-4 md:grid-cols-2"><fieldset><legend className="mb-2 font-medium">카테고리</legend>{taxonomy.data?.categories.map((category) => <label key={category.id} className="mr-3 inline-flex gap-1"><input type="checkbox" value={category.id} {...register("categoryIds")} />{category.name}</label>)}{taxonomy.data?.categories.length === 0 && <p className="text-sm text-slate-500">카테고리가 없습니다.</p>}</fieldset><fieldset><legend className="mb-2 font-medium">태그</legend>{taxonomy.data?.tags.map((tag) => <label key={tag.id} className="mr-3 inline-flex gap-1"><input type="checkbox" value={tag.id} {...register("tagIds")} />{tag.name}</label>)}<button type="button" className="mt-2 block text-sm underline" onClick={async () => { const name = window.prompt("새 태그 이름"); if (name?.trim()) { const result = await createTaxonomy.mutateAsync({ type: "tag", data: { name: name.trim() } }) as { item: { id: string } }; setValue("tagIds", [...(selectedTags ?? []), result.item.id]); } }}>+ 새 태그</button></fieldset></div>
    <fieldset><legend className="mb-2 font-medium">공개 상태</legend><label className="mr-4"><input type="radio" value="draft" {...register("status")} /> 임시 저장</label><label><input type="radio" value="published" {...register("status")} /> 공개</label></fieldset>
    {mutation.error && <p role="alert" className="text-red-600">{mutation.error.message}</p>}
    <button disabled={mutation.isPending} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">{mutation.isPending ? "저장 중…" : post ? "수정 저장" : "글 저장"}</button>
  </form>;
}
