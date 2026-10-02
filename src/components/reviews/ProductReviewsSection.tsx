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
}

export async function ProductReviewsSection({
  product,
  locale,
  sort,
}: ProductReviewsSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "reviews",
  });

  const reviewsPage = await getProductReviews(product.slug, {
    sort,
    limit: 10,
    page: 1,
  });

  const hasSummary =
    (product.reviews_count ?? 0) > 0 && product.average_rating != null;

  return (
    <section
      id="reviews"
      className="container mx-auto border-t border-marketplace-border/70 px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-marketplace-foreground sm:text-3xl">
            {t("title")}
          </h2>
        </div>
        {hasSummary ? (
          <div className="flex items-center gap-2 text-sm text-marketplace-muted-foreground">
            <span className="font-semibold text-marketplace-foreground">
              {product.average_rating?.toFixed(1)}
            </span>
            <span aria-hidden="true">/</span>
            <span>5</span>
          </div>
        ) : null}
      </div>

      {hasSummary ? (
        <div className="mb-8">
          <RatingDistribution product={product} locale={locale} />
        </div>
      ) : (
        <p className="text-gray-500 mb-8">{t("emptyProduct")}</p>
      )}

      {reviewsPage.data.length > 0 ? (
        <>
          <Suspense fallback={null}>
            <ProductReviewsSort current={sort} />
          </Suspense>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
