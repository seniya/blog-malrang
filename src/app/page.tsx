import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">blog.malrang.net</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">기록하고, 나누고, 다시 배우는 공간</h1>
        <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          개발과 일상에 관한 글을 차곡차곡 쌓아가는 개인 블로그입니다. 곧 새로운 글로
          찾아뵙겠습니다.
        </p>
      </div>
      <div>
        <Button asChild>
          <a href="mailto:hello@malrang.net">연락하기</a>
        </Button>
      </div>
    </main>
  );
}
