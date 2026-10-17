"use client";

import { BadgeCheck } from "@/components/icons";
import {
  badgeClassName,
  selectSellerTrustBadge,
} from "@/lib/merchandising/presentation";
import type { MerchandisingSignal } from "./MerchandisingBadges";

type MerchandisingSellerTrustProps = {
  signals: MerchandisingSignal[];
  sellerBadges?: ReadonlyArray<{ key: string }> | null;
  show?: boolean;
  className?: string;
};

export function MerchandisingSellerTrust({
  signals,
  sellerBadges = null,
  show = true,
  className = "",
}: MerchandisingSellerTrustProps) {
  const trust = selectSellerTrustBadge({
    signals,
    showSellerTrust: show,
    sellerBadges,
  });
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
