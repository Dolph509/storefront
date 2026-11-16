import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface SellerShopRatingSummaryProps {
  locale: string;
  averageRating: number | null;
  reviewsCount: number;
}

export async function SellerShopRatingSummary({
  locale,
  averageRating,
  reviewsCount,
}: SellerShopRatingSummaryProps) {
  const [t, tReviews] = await Promise.all([
    getTranslations({
      locale: locale as Locale,
      namespace: "sellers",
    }),
    getTranslations({
      locale: locale as Locale,
      namespace: "reviews",
    }),
  ]);

  if (reviewsCount === 0 || averageRating == null) {
    return <p className="text-sm text-[#595959]">{t("noReviews")}</p>;
  }

  return (
    <div className="text-[#26221f]">
      <p className="flex flex-wrap items-baseline gap-1.5">
        <span className="text-4xl font-semibold leading-none tracking-normal">
          {averageRating.toFixed(1)}
        </span>
        <Star className="size-5 fill-[#a66616] text-[#a66616]" aria-hidden />
      </p>
      <p className="mt-3 text-sm font-semibold text-[#37312b]">
        {t("shopReviewsAverageLabel")}
      </p>
      <p className="mt-1 text-sm text-[#6c655e]">
        {tReviews("reviewCount", { count: reviewsCount })}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-[#756e67]">
        {t("shopReviewsAverageHelp")}
      </p>
    </div>
  );
}
