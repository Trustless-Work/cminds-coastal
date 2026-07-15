import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/skeleton";

import { TransparencyLandingView } from "../features/transparency/views/TransparencyLandingView";

const LandingFallback = () => (
  <div className="mx-auto w-full max-w-[1320px] px-6 pb-16 pt-6 sm:px-10">
    <Skeleton className="h-[320px] w-full rounded-[32px]" />
    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="aspect-[16/10] w-full rounded-[24px]" />
      ))}
    </div>
  </div>
);

export default function Home() {
  return (
    <Suspense fallback={<LandingFallback />}>
      <TransparencyLandingView />
    </Suspense>
  );
}
