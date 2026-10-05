"use client";

import { BadgeCheck } from "@/components/icons";
import {
  badgeClassName,
  selectSellerTrustBadge,
} from "@/lib/merchandising/presentation";
import type { MerchandisingSignal } from "./MerchandisingBadges";

type MerchandisingSellerTrustProps = {
  signals: MerchandisingSignal[];
  show?: boolean;
  className?: string;
};

export function MerchandisingSellerTrust({
  signals,
  show = true,
  className = "",
}: MerchandisingSellerTrustProps) {
  const trust = selectSellerTrustBadge({ signals, showSellerTrust: show });
  if (!trust) return null;

  return (
    <span
      className={`${badgeClassName(trust)} ${className}`}
      data-merchandising-signal={trust.key}
      data-merchandising-presentation="seller_trust"
    >
      <BadgeCheck className="size-3 shrink-0" aria-hidden />
      {trust.label}
    </span>
  );
}
