import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ content }: Readonly<{ content: string }>) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-blue-600 dark:prose-a:text-blue-400">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
