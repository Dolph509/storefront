"use client";

import type { SellerFilter } from "@spree/sdk";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface SellerDropdownContentProps {
  filter: SellerFilter;
  selectedSellerId?: string;
  onChange: (sellerId?: string) => void;
}

export function SellerDropdownContent({
  filter,
  selectedSellerId,
  onChange,
}: SellerDropdownContentProps) {
  const t = useTranslations("products");

  return (
    <ul
      className="max-h-64 overflow-y-auto py-1"
      role="listbox"
      aria-label={t("sellerFilter")}
    >
      <li>
        <button
          type="button"
          role="option"
          aria-selected={!selectedSellerId}
          className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => onChange(undefined)}
        >
          <span>{t("anySeller")}</span>
          {!selectedSellerId ? (
            <Check className="h-4 w-4 text-primary" aria-hidden />
          ) : null}
        </button>
      </li>
      {filter.options.map((option) => {
        const active = selectedSellerId === option.id;
        return (
          <li key={option.id}>
            <button
              type="button"
              role="option"
              aria-selected={active}
              className="flex w-full items-center justify-between gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => onChange(option.id)}
            >
              <span className="truncate text-left">{option.name}</span>
              {active ? (
                <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
