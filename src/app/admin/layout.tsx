import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}