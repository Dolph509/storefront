import type { ProductReview } from "@spree/sdk";
import { BadgeCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { formatShopReviewDate } from "@/lib/utils/format";
import { SellerShopReviewReportButton } from "./SellerShopReviewReportButton";

interface SellerShopReviewCardProps {
  review: ProductReview;
  locale: string;
  basePath: string;
  reportLoginHref: string;
}

export async function SellerShopReviewCard({
  review,
  locale,
  basePath,
  reportLoginHref,
}: SellerShopReviewCardProps) {
  const tReviews = await getTranslations({
    locale: locale as Locale,
    namespace: "reviews",
  });
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "sellers",
  });

  const displayDate = review.published_at ?? review.created_at;
  const reviewer =
    review.customer_name?.trim() || tReviews("anonymousReviewer");
  const reviewerProfileHref = review.customer_id
    ? `${basePath}/members/${review.customer_id}`
    : null;
  const productHref = review.product_slug
    ? `${basePath}/products/${review.product_slug}`
    : null;

  return (
    <article className="py-7 first:pt-0">
      <header className="flex items-start gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f5f1ec] text-[#6a625b]"
          aria-hidden
        >
          <UserRound className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-5 text-[#4b4641]">
            {reviewerProfileHref ? (
              <Link
                href={reviewerProfileHref}
                aria-label={tReviews("viewReviewerProfile", { name: reviewer })}
                className="font-semibold text-[#26221f] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketplace-brand"
              >
                {reviewer}
              </Link>
            ) : (
              <span className="font-semibold text-[#26221f]">{reviewer}</span>
            )}
            <span className="text-[#77716b]">
              {" "}
              {t("reviewOnDate", {
                date: formatShopReviewDate(displayDate, locale),
              })}
            </span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StarRatingDisplay rating={review.rating} size="sm" />
            <span className="text-xs font-medium text-[#5a5149]">
              {review.rating.toFixed(1)} / 5
            </span>
          </div>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-[#f5f1ec] px-2.5 py-1 text-xs font-medium text-[#5a5149] sm:inline-flex">
          <BadgeCheck className="size-3.5" aria-hidden />
          {tReviews("verifiedPurchase")}
        </span>
      </header>

      <div className="mt-4 pl-[3.25rem]">
        {review.title ? (
          <h2 className="text-base font-semibold text-[#26221f]">
            {review.title}
          </h2>
        ) : null}
        {review.body ? (
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#403a35]">
            {review.body}
          </p>
        ) : null}

        {review.product_name && productHref ? (
          <a
            href={productHref}
            className="mt-4 inline-flex max-w-full items-center gap-3 text-sm font-medium text-[#51483d] underline decoration-[#a79a89]/60 underline-offset-2 transition-colors hover:text-[#26221f] hover:decoration-[#51483d]"
          >
            {review.product_thumbnail_url ? (
              // biome-ignore lint/performance/noImgElement: review product thumbnails come from the Store API
              <img
                src={review.product_thumbnail_url}
                alt=""
                className="size-12 shrink-0 rounded-sm object-cover"
              />
            ) : (
              <span className="size-12 shrink-0 rounded-sm bg-[#eee9e4]" />
            )}
            <span className="line-clamp-2">{review.product_name}</span>
          </a>
        ) : null}

        {review.seller_reply ? (
          <div className="mt-4 border-l-2 border-[#d8c9ad] pl-3">
            <p className="text-xs font-semibold text-[#51483d]">
              {tReviews("sellerResponse")}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-[#403a35]">
              {review.seller_reply}
            </p>
          </div>
        ) : null}

        <div className="mt-4">
          <SellerShopReviewReportButton
            reviewId={review.id}
            loginHref={reportLoginHref}
          />
        </div>
      </div>
    </article>
  );
}
