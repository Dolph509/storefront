import type { Product } from "@spree/sdk";
import { getTranslations } from "next-intl/server";
import { StarRatingDisplay } from "./StarRating";

interface RatingDistributionProps {
  product: Product;
  locale: string;
}

export async function RatingDistribution({
  product,
  locale,
}: RatingDistributionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "reviews",
  });

  const count = product.reviews_count ?? 0;
  const average = product.average_rating;
  const distribution = product.rating_distribution ?? {};

  if (count === 0 || average == null) {
    return null;
  }

  const maxBucket = Math.max(
    1,
    ...[1, 2, 3, 4, 5].map((star) => Number(distribution[String(star)] ?? 0)),
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
      <div className="text-center sm:text-left">
        <p className="text-4xl font-bold text-gray-900">{average.toFixed(1)}</p>
        <StarRatingDisplay rating={average} showValue={false} />
        <p className="mt-1 text-sm text-gray-500">
          {t("reviewCount", { count })}
        </p>
      </div>
      <ul className="flex-1 space-y-2 min-w-[12rem]">
        {[5, 4, 3, 2, 1].map((star) => {
          const bucket = Number(distribution[String(star)] ?? 0);
          const width = maxBucket > 0 ? (bucket / maxBucket) * 100 : 0;
          return (
            <li key={star} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-gray-600">{star}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="w-8 text-right text-gray-500 tabular-nums">
                {bucket}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
