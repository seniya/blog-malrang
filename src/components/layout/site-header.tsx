import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-semibold tracking-tight text-slate-950 dark:text-white">
          blog<span className="text-blue-600">.</span>malrang.net
        </Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/">글</Link>
          <a className="rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/rss.xml">RSS</a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
