import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function MarketplacePage({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] bg-marketplace-background px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}
