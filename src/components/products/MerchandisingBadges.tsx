"use client";

import { useTranslations } from "next-intl";

export type MerchandisingSignal = {
  key: string;
  label: string;
  priority: number;
  source: string;
  scope?: "global" | "personalized" | "editorial" | (string & {});
  presentation?: "hard_badge" | "soft_label" | "ranking_only" | (string & {});
  value?: number | string | null;
};

type MerchandisingBadgesProps = {
  signals: MerchandisingSignal[];
  maxBadges?: number;
  allowedSignals?: string[] | null;
  position?: "top_left" | "top_right";
  className?: string;
  excludeKeys?: string[];
  signalDataAttribute?:
    | "data-merchandising-signal"
    | "data-merchandising-pdp-signal";
};

function isHardBadge(signal: MerchandisingSignal) {
  return (signal.presentation ?? "hard_badge") === "hard_badge";
}

export function selectMerchandisingSignals({
  signals,
  maxBadges = 2,
  allowedSignals = null,
  excludeKeys = [],
  presentation = "hard_badge",
}: Pick<
  MerchandisingBadgesProps,
  "signals" | "maxBadges" | "allowedSignals" | "excludeKeys"
> & {
  presentation?: MerchandisingSignal["presentation"];
}): MerchandisingSignal[] {
  const allowed = allowedSignals
    ? new Set(allowedSignals.map((key) => key.trim()).filter(Boolean))
    : null;
  const excluded = new Set(excludeKeys);
  const limit = Math.max(0, Math.floor(maxBadges));

  return [...signals]
    .filter((signal) => (signal.presentation ?? "hard_badge") === presentation)
    .filter(
      (signal) =>
        (!allowed || allowed.has(signal.key)) && !excluded.has(signal.key),
    )
    .sort((left, right) => right.priority - left.priority)
    .slice(0, limit);
}

export function selectMerchandisingReason({
  signals,
  allowedSignals = null,
  excludeKeys = [],
}: Pick<
  MerchandisingBadgesProps,
  "signals" | "allowedSignals" | "excludeKeys"
>): MerchandisingSignal | null {
  const [reason] = selectMerchandisingSignals({
    signals,
    maxBadges: 1,
    allowedSignals,
    excludeKeys,
    presentation: "soft_label",
  });
  return reason ?? null;
}

export function MerchandisingBadges({
  signals,
  maxBadges = 2,
  allowedSignals = null,
  position = "top_left",
  className = "",
  excludeKeys = [],
  signalDataAttribute = "data-merchandising-signal",
}: MerchandisingBadgesProps) {
  const t = useTranslations("products");
  const visibleSignals = selectMerchandisingSignals({
    signals: signals.filter(isHardBadge),
    maxBadges,
    allowedSignals,
    excludeKeys,
    presentation: "hard_badge",
  });

  if (visibleSignals.length === 0) return null;

  return (
    <ul
      aria-label={t("productHighlights")}
      className={`pointer-events-none absolute top-2.5 z-[1] flex max-w-[calc(100%-3rem)] flex-wrap gap-1 ${
        position === "top_right" ? "right-2.5 justify-end" : "left-2.5"
      } ${className}`}
    >
      {visibleSignals.map((signal, index) => (
        <li
          key={`${signal.key}-${signal.source}-${index}`}
          {...{ [signalDataAttribute]: signal.key }}
          className={
            signal.key === "sale"
              ? "rounded-full bg-marketplace-sale px-2 py-0.5 text-[11px] font-semibold leading-4 text-white"
              : "rounded-full bg-marketplace-surface/95 px-2 py-0.5 text-[11px] font-medium leading-4 text-marketplace-foreground shadow-sm ring-1 ring-marketplace-border"
          }
        >
          {signal.label}
        </li>
      ))}
    </ul>
  );
}
