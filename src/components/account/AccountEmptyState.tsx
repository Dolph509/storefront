import type { ReactNode } from "react";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
import type { EmptyStateName } from "@/components/empty-states/paths.generated";
import { cn } from "@/lib/utils";

interface AccountEmptyStateProps {
  illustration: EmptyStateName;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function AccountEmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: AccountEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface px-6 py-10 text-center sm:px-10",
        className,
      )}
      data-theme-account-empty
    >
      <EmptyStateIllustration
        name={illustration}
        className="mx-auto mb-4 text-marketplace-muted-foreground"
      />
      <h2 className="text-lg font-semibold text-marketplace-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm text-marketplace-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
