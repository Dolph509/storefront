"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const SORTS = ["newest", "highest", "lowest"] as const;
export type ProductReviewSort = (typeof SORTS)[number];

interface ProductReviewsSortProps {
  current: ProductReviewSort;
}

export function ProductReviewsSort({ current }: ProductReviewsSortProps) {
  const t = useTranslations("reviews");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(sort: ProductReviewSort) {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "newest") {
      params.delete("review_sort");
    } else {
      params.set("review_sort", sort);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-gray-500">{t("sortBy")}</span>
      {SORTS.map((sort) => (
        <Link
          key={sort}
          href={hrefFor(sort)}
          scroll={false}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${
            current === sort
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t(`sort_${sort}`)}
        </Link>
      ))}
    </div>
  );
}
