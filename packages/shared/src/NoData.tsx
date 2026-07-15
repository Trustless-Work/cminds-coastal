import { Button } from "@repo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export type NoDataProps = {
  title: string;
  description: string;
  icon: ReactNode;
  link?: string;
  linkText?: string;
  className?: string;
  action?: ReactNode;
};

export function NoData({
  title,
  description,
  icon,
  link,
  linkText,
  className,
  action,
}: NoDataProps) {
  const showLink = Boolean(link && linkText);

  return (
    <Empty
      className={cn(
        "border border-dashed border-border bg-background py-12",
        className,
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>

      {showLink || action ? (
        <EmptyContent>
          {showLink ? (
            <Button size="sm" nativeButton={false} render={<Link href={link!} />}>
              {linkText}
            </Button>
          ) : null}
          {action}
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
