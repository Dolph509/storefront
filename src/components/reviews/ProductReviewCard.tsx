import type { ProductReview } from "@spree/sdk";
import { BadgeCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { formatDateTime } from "@/lib/utils/format";
import { StarRatingDisplay } from "./StarRating";

interface ProductReviewCardProps {
  review: ProductReview;
  locale: string;
  showProductLink?: boolean;
  basePath?: string;
}

export async function ProductReviewCard({
  review,
  locale,
  showProductLink = false,
  basePath = "",
}: ProductReviewCardProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "reviews",
  });

  const displayDate = review.published_at ?? review.created_at;
  const reviewer = review.customer_name?.trim() || t("anonymousReviewer");

  return (
    <article className="py-6 border-b border-gray-200 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <StarRatingDisplay rating={review.rating} size="sm" />
          {review.title ? (
            <h3 className="mt-1 text-sm font-semibold text-gray-900">
              {review.title}
            </h3>
          ) : null}
        </div>
        <time
          dateTime={displayDate}
          className="text-xs text-gray-500 whitespace-nowrap"
        >
          {formatDateTime(displayDate, locale)}
        </time>
      </div>

      <p className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-2">
        <span>{reviewer}</span>
        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          <BadgeCheck className="w-3.5 h-3.5" />
          {t("verifiedPurchase")}
        </span>
        {showProductLink && review.product_slug ? (
          <a
            href={`${basePath}/products/${review.product_slug}`}
            className="text-primary hover:underline"
          >
            {review.product_name}
          </a>
        ) : null}
      </p>

      {review.body ? (
        <p className="mt-3 text-sm text-gray-900 whitespace-pre-wrap">
          {review.body}
        </p>
      ) : null}

      {review.images?.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {review.images.map((image) => (
            <li key={image.id}>
              <a href={image.url} target="_blank" rel="noreferrer">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="max-h-32 max-w-[8rem] rounded-md border object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {review.seller_reply ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">
            {t("sellerResponse")}
            {review.seller_replied_at ? (
              <span className="font-normal">
                {" "}
                · {formatDateTime(review.seller_replied_at, locale)}
              </span>
            ) : null}
          </p>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {review.seller_reply}
          </p>
        </div>
      ) : null}
    </article>
  );
}
