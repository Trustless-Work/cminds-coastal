import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export const AdminPageHeader = ({
  title,
  description,
  actions,
}: AdminPageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      </header>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
};
