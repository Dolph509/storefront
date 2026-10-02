import type { ReactNode } from "react";

interface AccountPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
}

export function AccountPageHeader({
  title,
  description,
}: AccountPageHeaderProps) {
  return (
    <header className="mb-6" data-theme-account-page-header>
      <h1 className="text-2xl font-bold tracking-tight text-marketplace-foreground md:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 max-w-2xl text-sm text-marketplace-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}
