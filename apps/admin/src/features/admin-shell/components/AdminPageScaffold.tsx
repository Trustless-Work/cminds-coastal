import type { ReactNode } from "react";

import { AdminPageHeader } from "./AdminPageHeader";

type AdminPageScaffoldProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export const AdminPageScaffold = ({
  title,
  description,
  actions,
  children,
}: AdminPageScaffoldProps) => {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col gap-8">
      <AdminPageHeader
        title={title}
        description={description}
        actions={actions}
      />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
};
