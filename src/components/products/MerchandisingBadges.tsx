"use client";

import {
  Award,
  BadgeCheck,
  Heart,
  type LucideIcon,
  ShoppingCart,
  Sparkles,
  Tag,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  badgeClassName,
  type MerchandisingBadgeLayout,
  normalizePresentation,
  PRESENTATION,
  selectPdpSignals,
  selectProductCardImageBadges,
  selectRelevanceReason,
} from "@/lib/merchandising/presentation";

export type MerchandisingSignal = {
  key: string;
  label: string;
  priority: number;
  source: string;
  scope?: "global" | "personalized" | "editorial" | (string & {});
  presentation?:
    | "commerce_badge"
    | "availability_badge"
    | "marketplace_badge"
    | "relevance_reason"
    | "seller_trust"
    | "ranking_only"
    | "hard_badge"
    | "soft_label"
    | (string & {});
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
  inline?: boolean;
  layout?: MerchandisingBadgeLayout;
};

/** @deprecated Use selectProductCardImageBadges from presentation.ts */
export function selectMerchandisingSignals({
  signals,
  maxBadges = 2,
  allowedSignals = null,
  excludeKeys = [],
}: Pick<
  MerchandisingBadgesProps,
  "signals" | "maxBadges" | "allowedSignals" | "excludeKeys"
>): MerchandisingSignal[] {
  const excluded = new Set(excludeKeys);
  const filtered = signals.filter((signal) => !excluded.has(signal.key));
  return selectProductCardImageBadges({
    signals: filtered,
    maxBadges,
    allowedCommerceBadges: allowedSignals,
    allowedMarketplaceBadges: allowedSignals,
  });
}

export { selectRelevanceReason as selectMerchandisingReason };

const PRODUCT_CARD_IMAGE_BADGE_ICONS: Record<string, LucideIcon> = {
  sale: Tag,
  bestseller: Heart,
  popular_now: Award,
  cart_interest: ShoppingCart,
  new: Sparkles,
  editors_pick: Award,
  marketplace_pick: BadgeCheck,
};

function productCardImageBadgeIcon(key: string): LucideIcon {
  return PRODUCT_CARD_IMAGE_BADGE_ICONS[key] ?? BadgeCheck;
}

export function MerchandisingBadges({
  signals,
  maxBadges = 2,
  allowedSignals = null,
  position = "top_left",
  className = "",
  excludeKeys = [],
  signalDataAttribute = "data-merchandising-signal",
  inline = false,
  layout,
}: MerchandisingBadgesProps) {
  const t = useTranslations("products");
  const excluded = new Set(excludeKeys);
  const filteredSignals = signals.filter((signal) => !excluded.has(signal.key));
  const resolvedLayout = layout ?? (inline ? "inline" : "overlay");
  const visibleSignals = (
    resolvedLayout === "pdp-title"
      ? selectPdpSignals({ signals: filteredSignals, zone: "title" }).slice(
          0,
          maxBadges,
        )
      : resolvedLayout === "pdp-detail" ||
          resolvedLayout === "card-detail" ||
          resolvedLayout === "card-image-corner"
        ? filteredSignals.slice(0, maxBadges)
        : selectProductCardImageBadges({
            signals: filteredSignals,
            maxBadges,
            allowedCommerceBadges: allowedSignals,
            allowedMarketplaceBadges: allowedSignals,
          })
  ).filter(
    (signal) =>
      normalizePresentation(signal) !== PRESENTATION.RELEVANCE_REASON &&
      normalizePresentation(signal) !== PRESENTATION.SELLER_TRUST,
  );

  if (visibleSignals.length === 0) return null;

  const positionClass =
    resolvedLayout === "overlay"
      ? `absolute top-2.5 z-[1] flex max-w-[calc(100%-3rem)] flex-wrap gap-1 ${
          position === "top_right" ? "right-2.5 justify-end" : "left-2.5"
        }`
      : "static flex max-w-none flex-wrap items-center gap-1.5";

  if (resolvedLayout === "pdp-title") {
    return (
      <>
        {visibleSignals.map((signal, index) => (
          <span
            key={`${signal.key}-${signal.source}-${index}`}
            {...{ [signalDataAttribute]: signal.key }}
            data-merchandising-presentation={normalizePresentation(signal)}
            className={`inline-flex w-fit max-w-full shrink-0 self-start ${badgeClassName(signal, "pdp-title")} ${className}`}
          >
            {signal.label}
          </span>
        ))}
      </>
    );
  }

  if (resolvedLayout === "card-detail") {
    return (
      <fieldset
        className={`m-0 min-w-0 border-0 p-0 flex max-w-none flex-wrap items-baseline gap-x-3 gap-y-0.5 ${className}`}
      >
        <legend className="sr-only">{t("productHighlights")}</legend>
        {visibleSignals.map((signal, index) => (
          <span
            key={`${signal.key}-${signal.source}-${index}`}
            {...{ [signalDataAttribute]: signal.key }}
            data-merchandising-presentation={normalizePresentation(signal)}
            className={`inline-flex max-w-full shrink-0 ${badgeClassName(signal, "card-detail")}`}
          >
            {signal.label}
          </span>
        ))}
      </fieldset>
    );
  }

  if (resolvedLayout === "card-image-corner") {
    return (
      <ul
        aria-label={t("productHighlights")}
        className={`m-0 list-none p-0 ${className}`}
      >
        {visibleSignals.map((signal, index) => {
          const Icon = productCardImageBadgeIcon(signal.key);
          const iconTone =
            signal.key === "sale"
              ? "text-marketplace-sale"
              : "text-marketplace-brand";
          return (
            <li
              key={`${signal.key}-${signal.source}-${index}`}
              {...{ [signalDataAttribute]: signal.key }}
              data-merchandising-presentation={normalizePresentation(signal)}
              className={`rounded-br-[10px] ${badgeClassName(signal, "card-image-corner")}`}
            >
              <Icon
                className={`size-[18px] shrink-0 stroke-[1.75] ${iconTone}`}
                aria-hidden
              />
              <span className="truncate">{signal.label}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul
      aria-label={t("productHighlights")}
      className={`pointer-events-none m-0 list-none p-0 ${positionClass} ${className}`}
    >
      {visibleSignals.map((signal, index) => (
        <li
          key={`${signal.key}-${signal.source}-${index}`}
          {...{ [signalDataAttribute]: signal.key }}
          data-merchandising-presentation={normalizePresentation(signal)}
          className={`inline-flex w-fit max-w-full shrink-0 ${badgeClassName(signal, resolvedLayout)}`}
        >
          {signal.label}
        </li>
      ))}
    </ul>
  );
}
