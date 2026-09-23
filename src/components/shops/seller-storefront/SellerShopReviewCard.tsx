import type { ProductReview } from "@spree/sdk";
import { Flag, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { formatShopReviewDate } from "@/lib/utils/format";

interface SellerShopReviewCardProps {
  review: ProductReview;
  locale: string;
  basePath: string;
}

export async function SellerShopReviewCard({
  review,
  locale,
  basePath,
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
  const productHref = review.product_slug
    ? `${basePath}/products/${review.product_slug}`
    : null;

  return (
    <article className="py-8 first:pt-0">
      <div className="flex gap-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8e3df] text-[#8b8580]"
          aria-hidden
        >
          <User className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#222]">
            <span className="font-normal underline decoration-[#222]/40 underline-offset-2">
              {reviewer}
            </span>
            <span className="text-[#595959]">
              {" "}
              {t("reviewOnDate", {
                date: formatShopReviewDate(displayDate, locale),
              })}
            </span>
          </p>

          <div className="mt-2">
            <StarRatingDisplay rating={review.rating} size="sm" tone="dark" />
          </div>

          {review.body ? (
            <p className="mt-3 text-sm leading-relaxed text-[#222] whitespace-pre-wrap">
              {review.body}
            </p>
          ) : null}

          {review.product_name && productHref ? (
            <div className="mt-4 flex items-start gap-3">
              <div
                className="size-12 shrink-0 rounded-sm bg-[#f4f0ed] ring-1 ring-[#e8e3df]"
                aria-hidden
              />
              <a
                href={productHref}
                className="text-sm text-[#222] underline decoration-[#222]/40 underline-offset-2 hover:decoration-[#222]"
              >
                {review.product_name}
              </a>
            </div>
          ) : null}

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-sm text-[#595959] hover:text-[#222]"
          >
            <Flag className="size-3.5" aria-hidden />
            {t("reportReview")}
          </button>

          {review.seller_reply ? (
            <div className="mt-5 border-l-2 border-[#e8e3df] pl-4">
              <p className="text-xs font-medium text-[#595959]">
                {tReviews("sellerResponse")}
              </p>
              <p className="mt-1 text-sm text-[#222] whitespace-pre-wrap">
                {review.seller_reply}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
