import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function MarketplaceGrid({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-10",
        className,
      )}
      {...props}
    />
  );
}
