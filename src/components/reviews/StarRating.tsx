"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
    <div
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={t("ratingOutOf", {
        rating: rating.toFixed(1),
        max: String(max),
      })}
    >
      <span className="inline-flex" aria-hidden="true">
        {Array.from({ length: max }, (_, index) => {
          const filled = index < rounded;
          return (
            <Star
              key={index}
              className={`${iconClass} ${filled ? filledClass : "text-marketplace-border"}`}
            />
          );
        })}
      </span>
      {showValue ? (
        <span
          aria-hidden="true"
          className="text-sm text-marketplace-muted-foreground"
        >
          {t("ratingOutOf", { rating: rating.toFixed(1), max })}
        </span>
      ) : null}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  label,
  disabled = false,
}: StarRatingInputProps) {
  const t = useTranslations("reviews");
  const [hovered, setHovered] = useState(0);
  const activeValue = hovered || value;

  return (
    <div
      className="inline-flex gap-1"
      role="radiogroup"
      aria-label={label ?? t("ratingLabel")}
      aria-required="true"
    >
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        const filled = star <= activeValue;
        return (
          // biome-ignore lint/a11y/useSemanticElements: icon buttons for larger tap targets in star picker
          <button
            key={star}
            type="button"
            disabled={disabled}
            role="radio"
            aria-checked={value === star}
            className="rounded p-0.5 transition-transform duration-150 ease-out hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            onPointerEnter={() => setHovered(star)}
            onPointerLeave={() => setHovered(0)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`size-8 transition-colors duration-150 ${
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
