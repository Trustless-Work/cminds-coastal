import Link from "next/link";

import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center sm:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          CMinds Dashboard
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Review tasks and manage coastal conservation escrows.
        </p>
      </div>
      <Link href="/login" className={cn(buttonVariants())}>
        Sign in
      </Link>
    </main>
  );
}
