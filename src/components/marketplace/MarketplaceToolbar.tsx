import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function MarketplaceToolbar({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}
