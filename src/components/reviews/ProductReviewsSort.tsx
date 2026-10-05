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
    <nav
      aria-label={t("sortBy")}
      className="flex flex-wrap items-center gap-3 text-sm"
    >
      <span className="text-marketplace-muted-foreground">{t("sortBy")}</span>
      <div className="inline-flex rounded-md border border-marketplace-border-subtle bg-marketplace-surface p-1">
        {SORTS.map((sort) => (
          <Link
            key={sort}
            href={hrefFor(sort)}
            scroll={false}
            aria-current={current === sort ? "page" : undefined}
            className={`rounded-sm px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketplace-brand focus-visible:ring-offset-1 ${
              current === sort
                ? "bg-marketplace-surface-warm text-marketplace-brand"
                : "text-marketplace-muted-foreground hover:text-marketplace-foreground"
            }`}
          >
            {t(`sort_${sort}`)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
