import type { Product } from "@spree/sdk";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getProductReviews } from "@/lib/data/reviews";
import { ProductReviewCard } from "./ProductReviewCard";
import {
  type ProductReviewSort,
  ProductReviewsSort,
} from "./ProductReviewsSort";
import { RatingDistribution } from "./RatingDistribution";

interface ProductReviewsSectionProps {
  product: Product;
  locale: string;
  sort: ProductReviewSort;
  /** Under the gallery in the classic Etsy-style PDP column. */
  embedded?: boolean;
}

export async function ProductReviewsSection({
  product,
  locale,
  sort,
  embedded = false,
}: ProductReviewsSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "reviews",
  });

  const reviewsPage = await getProductReviews(product.slug, {
    sort,
    limit: embedded ? 6 : 10,
    page: 1,
  });

  const hasSummary =
    (product.reviews_count ?? 0) > 0 && product.average_rating != null;

  return (
    <section
      id="reviews"
      className={
        embedded
          ? "border-t border-marketplace-border/70 pt-10 pb-4"
          : "container mx-auto border-t border-marketplace-border/70 px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
      }
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-marketplace-foreground sm:text-3xl">
          {t("title")}
        </h2>
        {hasSummary ? (
          <p className="text-sm text-marketplace-muted-foreground">
            {t("reviewCount", { count: product.reviews_count ?? 0 })}
          </p>
        ) : null}
      </div>

      {hasSummary ? (
        <div className="mb-8 rounded-lg border border-marketplace-border-subtle bg-marketplace-surface p-4 sm:p-6">
          <RatingDistribution product={product} locale={locale} />
        </div>
      ) : (
        <p className="mb-8 rounded-md bg-marketplace-surface-warm/60 px-4 py-3 text-sm text-marketplace-muted-foreground">
          {t("emptyProduct")}
        </p>
      )}

      {reviewsPage.data.length > 0 ? (
        <>
          <Suspense fallback={null}>
            <ProductReviewsSort current={sort} />
          </Suspense>
          <div className="mt-5 grid max-w-4xl gap-4">
            {reviewsPage.data.map((review) => (
              <ProductReviewCard
                key={review.id}
                review={review}
                locale={locale}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
