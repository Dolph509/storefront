import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function MarketplaceRail({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-6 sm:px-6 lg:mx-0 lg:px-0",
        className,
      )}
      {...props}
    />
  );
}
