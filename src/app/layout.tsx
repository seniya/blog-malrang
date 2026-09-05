import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/providers/providers";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.malrang.net"),
  title: {
    default: "blog.malrang.net",
    template: "%s | blog.malrang.net",
  },
  description: "개발과 일상을 기록하는 개인 블로그",
};

type RootLayoutProps = Readonly<{ children: ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
