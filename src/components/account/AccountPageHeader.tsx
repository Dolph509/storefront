import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AccountPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function AccountPageHeader({
  title,
  description,
  className,
}: AccountPageHeaderProps) {
  return (
    <header className={cn("mb-6", className)} data-theme-account-page-header>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-marketplace-brand md:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-1.5 max-w-2xl text-sm text-marketplace-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}
