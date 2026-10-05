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

  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(0,1.3fr)] sm:items-center sm:gap-8">
      <div className="flex items-center gap-4 sm:block">
        <p className="font-display text-4xl font-semibold tabular-nums text-marketplace-foreground">
          {average.toFixed(1)}
        </p>
        <div>
          <StarRatingDisplay rating={average} showValue={false} />
          <p className="mt-1 text-sm text-marketplace-muted-foreground">
            {t("reviewCount", { count })}
          </p>
        </div>
      </div>
      <ul className="min-w-0 space-y-2.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const bucket = Number(distribution[String(star)] ?? 0);
          const width = count > 0 ? (bucket / count) * 100 : 0;
          return (
            <li key={star} className="flex items-center gap-2.5 text-sm">
              <span className="w-8 shrink-0 text-marketplace-muted-foreground">
                {star} <span className="sr-only">/ 5</span>
              </span>
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-marketplace-surface-warm"
                role="progressbar"
                aria-label={t("starLabel", { count: star })}
                aria-valuemin={0}
                aria-valuemax={count}
                aria-valuenow={bucket}
              >
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs tabular-nums text-marketplace-muted-foreground">
                {bucket}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
