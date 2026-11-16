import { getTranslations } from "next-intl/server";
import { StarRatingDisplay } from "@/components/reviews/StarRating";

interface SellerRatingSummaryProps {
  locale: string;
  averageRating: number | null;
  reviewsCount: number;
  distribution?: Record<string, number> | null;
  /** When true, only the star breakdown bars are shown. */
  barsOnly?: boolean;
}

export async function SellerRatingSummary({
  locale,
  averageRating,
  reviewsCount,
  distribution = {},
  barsOnly = false,
}: SellerRatingSummaryProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "reviews",
  });

  if (reviewsCount === 0 || averageRating == null) {
    return <p className="text-gray-500">{t("emptyProduct")}</p>;
  }

  const maxBucket = Math.max(
    1,
    ...[1, 2, 3, 4, 5].map((star) => Number(distribution?.[String(star)] ?? 0)),
  );

  const bars = (
    <div className="flex-1 space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = Number(distribution?.[String(star)] ?? 0);
        const width = Math.round((count / maxBucket) * 100);
        return (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="w-8 text-gray-600">{star}★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="w-8 text-right text-gray-500">{count}</span>
          </div>
        );
      })}
    </div>
  );

  if (barsOnly) return bars;

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
      <div className="text-center sm:text-left">
        <p className="text-5xl font-bold text-gray-900">
          {averageRating.toFixed(1)}
        </p>
        <StarRatingDisplay rating={averageRating} showValue={false} />
        <p className="mt-2 text-sm text-gray-500">
          {t("reviewCount", { count: reviewsCount })}
        </p>
      </div>
      {bars}
    </div>
  );
}
