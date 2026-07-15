import type { ReactNode } from "react";

import { AdminAuthGate } from "@/features/auth/components/AdminAuthGate";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <AdminAuthGate>{children}</AdminAuthGate>;
}
