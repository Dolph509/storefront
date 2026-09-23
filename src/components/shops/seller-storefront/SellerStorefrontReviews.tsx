import { getTranslations } from "next-intl/server";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
import { getSellerReviews } from "@/lib/data/sellers";
import {
  sellerShopPath,
  sellerShopShellClass,
} from "@/lib/utils/seller-storefront";
import { SellerRatingSummary } from "./SellerRatingSummary";
import { SellerShopRatingSummary } from "./SellerShopRatingSummary";
import { SellerShopReviewCard } from "./SellerShopReviewCard";
import { SellerShopReviewSortForm } from "./SellerShopReviewSortForm";

interface SellerStorefrontReviewsProps {
  slug: string;
  basePath: string;
  locale: string;
  page: number;
  sort?: string;
  averageRating: number | null;
  reviewsCount: number;
  distribution?: Record<string, number> | null;
}

export async function SellerStorefrontReviews({
  slug,
  basePath,
  locale,
  page,
  sort,
  averageRating,
  reviewsCount,
  distribution,
}: SellerStorefrontReviewsProps) {
  const t = await getTranslations("sellers");
  const reviewsPath = sellerShopPath(basePath, slug, "reviews");
  const reviewSort =
    sort === "newest" || sort === "highest" || sort === "lowest"
      ? sort
      : undefined;
  const reviews = await getSellerReviews(slug, page, 10, reviewSort);

  return (
    <div className={`${sellerShopShellClass} bg-[#faf9f7] py-8 md:py-10`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-[#222]">
          {t("tab_reviews")}
        </h1>
        {reviewsCount > 0 ? (
          <SellerShopReviewSortForm action={reviewsPath} sort={reviewSort} />
        ) : null}
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] lg:gap-x-14 lg:gap-y-0">
        <aside className="mb-8 space-y-8 lg:mb-0 lg:pt-1">
          <SellerShopRatingSummary
            locale={locale}
            averageRating={averageRating}
            reviewsCount={reviewsCount}
          />
          {distribution && reviewsCount > 0 ? (
            <div className="hidden lg:block">
              <SellerRatingSummary
                locale={locale}
                averageRating={averageRating}
                reviewsCount={reviewsCount}
                distribution={distribution}
                barsOnly
              />
            </div>
          ) : null}
        </aside>

        <div className="min-w-0 border-t border-[#e8e3df] lg:border-t-0">
          {reviews.data.length ? (
            <div className="divide-y divide-[#e8e3df]">
              {reviews.data.map((review) => (
                <SellerShopReviewCard
                  key={review.id}
                  review={review}
                  locale={locale}
                  basePath={basePath}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-[#595959]">
              <EmptyStateIllustration
                name="no-reviews-yet"
                className="mx-auto mb-3 text-gray-600"
              />
              <p>{t("noReviews")}</p>
            </div>
          )}
        </div>
      </div>

      {reviews.meta.pages > 1 ? (
        <nav
          className="mt-10 flex justify-center gap-4"
          aria-label={t("reviewsPages")}
        >
          {page > 1 ? (
            <a
              href={sellerShopPath(basePath, slug, "reviews", {
                page: String(page - 1),
                sort: reviewSort,
              })}
              className="text-sm font-medium text-[#222] underline"
            >
              {t("previous")}
            </a>
          ) : null}
          <span className="text-sm text-[#757575]">
            {t("pageOf", { page, pages: reviews.meta.pages })}
          </span>
          {page < reviews.meta.pages ? (
            <a
              href={sellerShopPath(basePath, slug, "reviews", {
                page: String(page + 1),
                sort: reviewSort,
              })}
              className="text-sm font-medium text-[#222] underline"
            >
              {t("next")}
            </a>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
