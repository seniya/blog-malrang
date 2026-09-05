import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200/80 dark:border-slate-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>기록하고, 나누고, 다시 배우는 공간</p>
        <Link href="/rss.xml" className="hover:text-blue-600">RSS 구독</Link>
      </div>
    </footer>
  );
}
