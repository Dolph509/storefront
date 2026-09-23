"use client";

import { useTranslations } from "next-intl";

interface SellerShopSortFormProps {
  action: string;
  section?: string;
  query?: string;
  sort?: string;
  onSale?: string;
}

export function SellerShopSortForm({
  action,
  section,
  query,
  sort,
  onSale,
}: SellerShopSortFormProps) {
  const t = useTranslations("sellers");

  return (
    <form
      method="get"
      action={action}
      className="flex items-center gap-1 text-sm text-[#595959]"
    >
      <input type="hidden" name="tab" value="products" />
      {section ? <input type="hidden" name="section" value={section} /> : null}
      {query ? <input type="hidden" name="q" value={query} /> : null}
      {onSale === "1" ? <input type="hidden" name="sale" value="1" /> : null}
      <label htmlFor="shop-sort" className="shrink-0">
        {t("sortLabel")}:
      </label>
      <select
        id="shop-sort"
        name="sort"
        defaultValue={sort ?? ""}
        className="max-w-[11rem] cursor-pointer border-0 bg-transparent py-1 pr-6 text-sm font-medium text-[#222] focus:outline-none focus:ring-0"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="">{t("sort_recommended")}</option>
        <option value="best_selling">{t("sort_best_selling")}</option>
        <option value="available_on_desc">{t("sort_newest")}</option>
        <option value="price_asc">{t("sort_price_asc")}</option>
        <option value="price_desc">{t("sort_price_desc")}</option>
      </select>
    </form>
  );
}
