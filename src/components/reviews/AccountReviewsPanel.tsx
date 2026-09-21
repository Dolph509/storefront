import type { ProductReview, ReviewablePurchase } from "@spree/sdk";
import { Star } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductImage } from "@/components/ui/product-image";
import {
  canEditExistingReview,
  inferReviewWindowDays,
} from "@/lib/reviews/line-item-review-state";
import { formatDateTime } from "@/lib/utils/format";
import { AccountReviewActions } from "./AccountReviewActions";
import { StarRatingDisplay } from "./StarRating";

interface AccountReviewsPanelProps {
  reviewablePurchases: ReviewablePurchase[];
  myReviews: ProductReview[];
  deliveredAtByLineItem: Record<string, string>;
  basePath: string;
  locale: string;
}

export async function AccountReviewsPanel({
  reviewablePurchases,
  myReviews,
  deliveredAtByLineItem,
  basePath,
  locale,
}: AccountReviewsPanelProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "reviews",
  });

  const windowDays = inferReviewWindowDays(reviewablePurchases);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("toWriteTitle")}
        </h2>
        {reviewablePurchases.length === 0 ? (
          <p className="text-sm text-gray-500">{t("toWriteEmpty")}</p>
        ) : (
          <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
            {reviewablePurchases.map((purchase) => (
              <li
                key={purchase.line_item_id}
                className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center"
              >
                <div className="relative w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <ProductImage
                    src={purchase.thumbnail_url}
                    alt={purchase.product_name ?? t("productFallback")}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.product_name ?? t("productFallback")}
                  </p>
                  {purchase.order_number ? (
                    <p className="text-xs text-gray-500 mt-1">
                      {t("orderNumber", { number: purchase.order_number })}
                    </p>
                  ) : null}
                  {purchase.review_window_closes_at ? (
                    <p className="text-xs text-gray-500 mt-1">
                      {t("reviewBy", {
                        date: formatDateTime(
                          purchase.review_window_closes_at,
                          locale,
                        ),
                      })}
                    </p>
                  ) : null}
                </div>
                <AccountReviewActions mode="create" purchase={purchase} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("yourReviewsTitle")}
        </h2>
        {myReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("yourReviewsEmptyTitle")}
            </h3>
            <p className="text-gray-500">{t("yourReviewsEmpty")}</p>
          </div>
        ) : (
          <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
            {myReviews.map((review) => {
              const deliveredAt =
                deliveredAtByLineItem[review.line_item_id] ??
                reviewablePurchases.find(
                  (p) => p.line_item_id === review.line_item_id,
                )?.delivered_at;
              const editable = canEditExistingReview(
                review,
                deliveredAt,
                windowDays,
              );
              return (
                <li key={review.id} className="px-6 py-4 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <StarRatingDisplay rating={review.rating} size="sm" />
                      {review.product_slug ? (
                        <Link
                          href={`${basePath}/products/${review.product_slug}`}
                          className="mt-1 block text-sm font-medium text-gray-900 hover:text-primary"
                        >
                          {review.product_name}
                        </Link>
                      ) : (
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {review.product_name}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {t(`status_${review.status}`, {
                        defaultValue: review.status,
                      })}
                    </span>
                  </div>
                  {review.body ? (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {review.body}
                    </p>
                  ) : null}
                  <AccountReviewActions
                    mode="edit"
                    review={review}
                    editable={editable}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
