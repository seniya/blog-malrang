import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function SiteShell({ children }: Readonly<{ children: ReactNode }>) {
  return <><SiteHeader /><main className="mx-auto min-h-[calc(100vh-8rem)] max-w-5xl px-5 py-12 sm:px-8">{children}</main><SiteFooter /></>;
}
