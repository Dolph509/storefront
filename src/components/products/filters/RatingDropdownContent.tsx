"use client";

import type { RatingFilter } from "@spree/sdk";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface RatingDropdownContentProps {
  filter: RatingFilter;
  selectedMinimum?: number;
  onChange: (minimum?: number) => void;
}

export function RatingDropdownContent({
  filter,
  selectedMinimum,
  onChange,
}: RatingDropdownContentProps) {
  const t = useTranslations("products");

  return (
    <ul className="py-1" role="listbox" aria-label={t("ratingFilter")}>
      <li>
        <button
          type="button"
          role="option"
          aria-selected={selectedMinimum === undefined}
          className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => onChange(undefined)}
        >
          <span>{t("anyRating")}</span>
          {selectedMinimum === undefined ? (
            <Check className="h-4 w-4 text-primary" aria-hidden />
          ) : null}
        </button>
      </li>
      {filter.options.map((option) => {
        const active = selectedMinimum === option.minimum;
        return (
          <li key={option.id}>
            <button
              type="button"
              role="option"
              aria-selected={active}
              className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => onChange(option.minimum)}
            >
              <span>{t("ratingStarsUp", { count: option.minimum })}</span>
              {active ? (
                <Check className="h-4 w-4 text-primary" aria-hidden />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
