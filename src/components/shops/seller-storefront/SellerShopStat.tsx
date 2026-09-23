import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SellerShopStatProps {
  icon: LucideIcon;
  children: ReactNode;
}

/** Inline stat with icon for shop header / sidebar. */
export function SellerShopStat({ icon: Icon, children }: SellerShopStatProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5 shrink-0 text-[#6b5f5a]" aria-hidden />
      <span>{children}</span>
    </span>
  );
}
