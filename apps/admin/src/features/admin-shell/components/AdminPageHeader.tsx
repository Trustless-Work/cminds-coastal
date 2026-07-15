type AdminPageHeaderProps = {
  title: string;
  description: string;
};

export const AdminPageHeader = ({
  title,
  description,
}: AdminPageHeaderProps) => {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
        {description}
      </p>
    </header>
  );
};
