import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarketplaceErrorStateProps {
  title: ReactNode;
  description?: ReactNode;
  retry?: ReactNode;
  className?: string;
}

export function MarketplaceErrorState({
  title,
  description,
  retry,
  className,
}: MarketplaceErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-[var(--marketplace-radius-md)] border border-marketplace-danger/30 bg-marketplace-surface px-5 py-6 text-marketplace-foreground",
        className,
      )}
    >
      <div className="flex gap-3">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-marketplace-danger" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-marketplace-muted-foreground">
              {description}
            </p>
          ) : null}
          {retry ? <div className="mt-4">{retry}</div> : null}
        </div>
      </div>
    </div>
  );
}
