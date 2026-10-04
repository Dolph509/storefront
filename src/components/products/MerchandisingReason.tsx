"use client";

import {
  type MerchandisingSignal,
  selectMerchandisingReason,
} from "./MerchandisingBadges";

type MerchandisingReasonProps = {
  signals: MerchandisingSignal[];
  allowedSignals?: string[] | null;
  className?: string;
};

export function MerchandisingReason({
  signals,
  allowedSignals = null,
  className = "",
}: MerchandisingReasonProps) {
  const reason = selectMerchandisingReason({ signals, allowedSignals });
  if (!reason) return null;

  return (
    <p
      className={`text-xs font-medium text-marketplace-muted-foreground ${className}`}
      data-merchandising-reason={reason.key}
      data-merchandising-signal={reason.key}
    >
      {reason.label}
    </p>
  );
}
