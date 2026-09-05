import Link from "next/link";

export default function NotFound() {
  return <div className="py-20 text-center"><h1 className="text-3xl font-bold">페이지를 찾을 수 없습니다</h1><p className="mt-3 text-slate-600 dark:text-slate-300">요청한 글이 없거나 아직 공개되지 않았습니다.</p><Link href="/" className="mt-8 inline-block text-blue-600">홈으로 돌아가기</Link></div>;
}
