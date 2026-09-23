"use client";

import { Tag } from "lucide-react";
import { useTranslations } from "next-intl";

interface SellerShopProductFiltersProps {
  action: string;
  section?: string;
  query?: string;
  sort?: string;
  onSale?: string;
}

function buildHref(
  action: string,
  params: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams();
  search.set("tab", "products");
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${action}?${qs}` : action;
}

export function SellerShopProductFilters({
  action,
  section,
  query,
  sort,
  onSale,
}: SellerShopProductFiltersProps) {
  const t = useTranslations("sellers");
  const onSaleActive = onSale === "1";

  const baseParams = {
    section,
    q: query,
    sort,
  };

  const onSaleHref = buildHref(action, {
    ...baseParams,
    sale: onSaleActive ? undefined : "1",
  });

  const clearHref = buildHref(action, baseParams);

  const hasActiveFilter = onSaleActive;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <a
        href={onSaleHref}
        aria-current={onSaleActive ? "true" : undefined}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors ${
          onSaleActive
            ? "border-[#222] bg-[#222] font-medium text-white"
            : "border-[#ddd6d2] bg-white text-[#595959] hover:border-[#222] hover:text-[#222]"
        }`}
      >
        <Tag className="size-3.5" aria-hidden />
        {t("filterOnSale")}
      </a>
      {hasActiveFilter ? (
        <a
          href={clearHref}
          className="text-[#595959] underline decoration-[#595959]/40 underline-offset-2 hover:text-[#222]"
        >
          {t("filterClear")}
        </a>
      ) : null}
    </div>
  );
}
