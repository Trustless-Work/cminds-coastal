import { Skeleton } from "@repo/ui/components/skeleton";

export const PublicProfileSkeleton = () => (
  <div
    role="status"
    aria-label="Loading profile"
    className="mx-auto w-full max-w-[820px] px-6 pb-24 pt-8 sm:px-10"
  >
    <Skeleton className="h-[112px] w-full rounded-[24px]" />
    <Skeleton className="mt-6 h-[160px] w-full rounded-[24px]" />
    <Skeleton className="mt-6 h-[140px] w-full rounded-[24px]" />
  </div>
);
