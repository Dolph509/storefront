"use client";

import { WandSparkles } from "@/components/icons";
import {
  type MerchandisingSignal,
  selectMerchandisingReason,
} from "./MerchandisingBadges";

type MerchandisingReasonProps = {
  signals: MerchandisingSignal[];
  allowedSignals?: string[] | null;
  excludeKeys?: string[];
  className?: string;
};

export function MerchandisingReason({
  signals,
  allowedSignals = null,
  excludeKeys = [],
  className = "",
}: MerchandisingReasonProps) {
  const reason = selectMerchandisingReason({
    signals,
    allowedSignals,
    excludeKeys,
  });
  if (!reason) return null;

  return (
    <p
      className={`flex items-start gap-1.5 text-xs font-medium leading-snug text-marketplace-muted-foreground ${className}`}
      data-merchandising-reason={reason.key}
      data-merchandising-presentation="relevance_reason"
    >
      <WandSparkles
        className="mt-0.5 size-3.5 shrink-0 text-marketplace-brand"
        aria-hidden
      />
      <span>{reason.label}</span>
    </p>
  );
}
