"use client";

import { Store } from "lucide-react";
import { WandSparkles } from "@/components/icons";
import {
  type MerchandisingSignal,
  selectMerchandisingReason,
} from "./MerchandisingBadges";

type MerchandisingReasonProps = {
  signals: MerchandisingSignal[];
  allowedSignals?: string[] | null;
  excludeKeys?: string[];
  followedShopLabel?: string;
  className?: string;
};

export function MerchandisingReason({
  signals,
  allowedSignals = null,
  excludeKeys = [],
  followedShopLabel,
  className = "",
}: MerchandisingReasonProps) {
  const reason = selectMerchandisingReason({
    signals,
    allowedSignals,
    excludeKeys,
  });
  if (!reason) return null;
  const isFollowedShopReason =
    reason.key === "followed_shop" || reason.key === "new_from_followed_shop";

  return (
    <p
      className={`${isFollowedShopReason ? "inline-flex max-w-full items-center gap-2 text-xs font-medium leading-snug text-marketplace-muted-foreground" : "flex items-start gap-1.5 text-xs font-medium leading-snug text-marketplace-muted-foreground"} ${className}`}
      data-merchandising-reason={reason.key}
      data-merchandising-presentation="relevance_reason"
    >
      {isFollowedShopReason ? (
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-marketplace-accent text-marketplace-brand">
          <Store className="size-3.5" aria-hidden="true" strokeWidth={2} />
        </span>
      ) : (
        <WandSparkles
          className="mt-0.5 size-3.5 shrink-0 text-marketplace-brand"
          aria-hidden
        />
      )}
      <span>
        {isFollowedShopReason && followedShopLabel
          ? followedShopLabel
          : reason.label}
      </span>
    </p>
  );
}
