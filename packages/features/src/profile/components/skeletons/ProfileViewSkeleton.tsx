import { Skeleton } from "@repo/ui/components/skeleton";

export const ProfileViewSkeleton = () => (
  <div
    role="status"
    aria-label="Loading profile"
    className="mx-auto w-full max-w-[1100px] px-6 pb-24 pt-8 sm:px-10"
  >
    <Skeleton className="h-8 w-40 rounded-lg" />
    <Skeleton className="mt-3 h-5 w-72 max-w-full rounded-lg" />

    <Skeleton className="mt-8 h-[112px] w-full rounded-[24px]" />

    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <Skeleton className="h-[280px] w-full rounded-[24px]" />
        <Skeleton className="h-[220px] w-full rounded-[24px]" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-[24px]" />
    </div>
  </div>
);
