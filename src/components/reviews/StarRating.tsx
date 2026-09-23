"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface StarRatingDisplayProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  /** Shop review lists use solid dark stars (Etsy-style). */
  tone?: "amber" | "dark";
}

export function StarRatingDisplay({
  rating,
  max = 5,
  size = "md",
  showValue = false,
  tone = "amber",
}: StarRatingDisplayProps) {
  const t = useTranslations("reviews");
  const iconClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const rounded = Math.max(0, Math.min(max, Math.round(rating)));
  const filledClass =
    tone === "dark"
      ? "fill-[#222] text-[#222]"
      : "fill-amber-400 text-amber-400";

  return (
    <div className="inline-flex items-center gap-1" aria-hidden={!showValue}>
      <span className="inline-flex">
        {Array.from({ length: max }, (_, index) => {
          const filled = index < rounded;
          return (
            <Star
              key={index}
              className={`${iconClass} ${
                filled ? filledClass : "text-gray-300"
              }`}
            />
          );
        })}
      </span>
      {showValue ? (
        <span className="text-sm text-gray-600">
          {t("ratingOutOf", { rating: rating.toFixed(1), max })}
        </span>
      ) : null}
      <span className="sr-only">
        {t("ratingOutOf", { rating: String(rating), max: String(max) })}
      </span>
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  const t = useTranslations("reviews");

  return (
    <div
      className="inline-flex gap-1"
      role="radiogroup"
      aria-label={t("ratingLabel")}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        const filled = star <= value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: icon buttons for larger tap targets in star picker
          <button
            key={star}
            type="button"
            disabled={disabled}
            role="radio"
            aria-checked={value === star}
            className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            onClick={() => onChange(star)}
          >
            <Star
              className={`w-8 h-8 ${
                filled ? "fill-amber-400 text-amber-400" : "text-gray-300"
              }`}
            />
            <span className="sr-only">{t("starLabel", { count: star })}</span>
          </button>
        );
      })}
    </div>
  );
}
