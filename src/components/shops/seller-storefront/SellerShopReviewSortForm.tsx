"use client";

import { useTranslations } from "next-intl";

interface SellerShopReviewSortFormProps {
  action: string;
  sort?: string;
}

export function SellerShopReviewSortForm({
  action,
  sort,
}: SellerShopReviewSortFormProps) {
  const tReviews = useTranslations("reviews");
  const t = useTranslations("sellers");

  const value =
    sort === "newest" || sort === "highest" || sort === "lowest" ? sort : "";

  return (
    <form
      method="get"
      action={action}
      className="flex items-center gap-1 text-sm text-[#595959]"
    >
      <input type="hidden" name="tab" value="reviews" />
      <label htmlFor="shop-review-sort">{tReviews("sortBy")}:</label>
      <select
        id="shop-review-sort"
        name="sort"
        defaultValue={value}
        className="cursor-pointer border-0 bg-transparent py-0 pl-0 pr-6 text-sm font-medium text-[#222] underline decoration-[#222]/30 underline-offset-2 focus:outline-none focus:ring-0"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="">{t("sort_reviews_suggested")}</option>
        <option value="newest">{tReviews("sort_newest")}</option>
        <option value="highest">{tReviews("sort_highest")}</option>
        <option value="lowest">{tReviews("sort_lowest")}</option>
      </select>
    </form>
  );
}
