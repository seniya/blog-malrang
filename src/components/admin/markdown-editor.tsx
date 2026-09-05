"use client";

import { forwardRef, useRef } from "react";

import { Markdown } from "@/components/posts/markdown";

type Selection = Readonly<{ start: number; end: number }>;
export type MarkdownAction = "bold" | "italic" | "heading" | "quote" | "link" | "image" | "bulletList" | "orderedList" | "code";

type EditResult = Readonly<{ value: string; start: number; end: number }>;

function wrap(value: string, selection: Selection, prefix: string, suffix = prefix): EditResult {
  const selected = value.slice(selection.start, selection.end);
  const replacement = `${prefix}${selected || "텍스트"}${suffix}`;
  const selectedStart = selection.start + prefix.length;
  return { value: `${value.slice(0, selection.start)}${replacement}${value.slice(selection.end)}`, start: selectedStart, end: selectedStart + (selected ? selected.length : "텍스트".length) };
}

export function applyMarkdownAction(value: string, selection: Selection, action: MarkdownAction): EditResult {
  switch (action) {
    case "bold": return wrap(value, selection, "**");
    case "italic": return wrap(value, selection, "*");
    case "heading": return wrap(value, selection, "## ", "");
    case "quote": return wrap(value, selection, "> ", "");
    case "link": return wrap(value, selection, "[", "](https://)");
    case "image": return wrap(value, selection, "![", "](https://)");
    case "code": return wrap(value, selection, "`", "`");
    case "bulletList": {
      const selected = value.slice(selection.start, selection.end) || "목록 항목";
      const replacement = selected.split("\n").map((line) => `- ${line}`).join("\n");
      return { value: `${value.slice(0, selection.start)}${replacement}${value.slice(selection.end)}`, start: selection.start, end: selection.start + replacement.length };
    }
    case "orderedList": {
      const selected = value.slice(selection.start, selection.end) || "목록 항목";
      const replacement = selected.split("\n").map((line, index) => `${index + 1}. ${line}`).join("\n");
      return { value: `${value.slice(0, selection.start)}${replacement}${value.slice(selection.end)}`, start: selection.start, end: selection.start + replacement.length };
    }
  }
}

const toolbar: ReadonlyArray<Readonly<{ action: MarkdownAction; label: string; title: string }>> = [
  { action: "bold", label: "B", title: "굵게 (Ctrl/Cmd+B)" },
  { action: "italic", label: "I", title: "기울임 (Ctrl/Cmd+I)" },
  { action: "heading", label: "H", title: "소제목" },
  { action: "quote", label: "❞", title: "인용" },
  { action: "link", label: "링크", title: "링크" },
  { action: "image", label: "이미지", title: "이미지" },
  { action: "bulletList", label: "• 목록", title: "순서 없는 목록" },
  { action: "orderedList", label: "1. 목록", title: "순서 있는 목록" },
  { action: "code", label: "코드", title: "인라인 코드" },
];

type MarkdownEditorProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  name?: string;
}>;

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(function MarkdownEditor({ value, onChange, onBlur, name }, ref) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = (element: HTMLTextAreaElement | null) => {
    textareaRef.current = element;
    if (typeof ref === "function") ref(element);
    else if (ref) ref.current = element;
  };
  const apply = (action: MarkdownAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const result = applyMarkdownAction(value, { start: textarea.selectionStart, end: textarea.selectionEnd }, action);
    onChange(result.value);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.start, result.end);
    });
  };
  return (
    <div className="overflow-hidden rounded border border-slate-300 dark:border-slate-700">
      <div className="flex flex-wrap gap-1 border-b bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900" aria-label="Markdown 도구 모음">
        {toolbar.map((item) => <button key={item.action} type="button" title={item.title} aria-label={item.title} onClick={() => apply(item.action)} className="rounded px-2 py-1 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">{item.label}</button>)}
      </div>
      <div className="lg:grid lg:grid-cols-2">
        <textarea ref={setRefs} name={name} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} onKeyDown={(event) => {
          if (!(event.ctrlKey || event.metaKey)) return;
          const action = event.key.toLowerCase() === "b" ? "bold" : event.key.toLowerCase() === "i" ? "italic" : event.key.toLowerCase() === "k" ? "link" : null;
          if (action) { event.preventDefault(); apply(action); }
        }} aria-label="Markdown 본문 입력" placeholder="Markdown으로 본문을 작성하세요…" className="min-h-[28rem] w-full resize-y border-0 p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:border-r dark:border-slate-700" spellCheck={false} />
        <section aria-label="Markdown preview" className="min-h-[28rem] border-t bg-white p-4 dark:bg-slate-950 lg:border-t-0"><h2 className="mb-3 text-sm font-semibold text-slate-500">미리보기</h2><Markdown content={value || "미리보기할 내용이 없습니다."} /></section>
      </div>
      <p className="border-t bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900">Markdown 문법을 사용할 수 있습니다. 데스크톱에서는 입력과 미리보기가 함께 표시됩니다.</p>
    </div>
  );
});
