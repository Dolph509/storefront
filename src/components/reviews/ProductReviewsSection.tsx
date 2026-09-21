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
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("title")}</h2>

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
          <div className="mt-6 bg-white rounded-xl border border-gray-200 px-6">
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
