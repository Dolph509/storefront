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
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "sellers",
  });

  if (reviewsCount === 0 || averageRating == null) {
    return <p className="text-sm text-[#595959]">{t("noReviews")}</p>;
  }

  const formattedCount = new Intl.NumberFormat(locale).format(reviewsCount);

  return (
    <div className="text-[#222]">
      <p className="flex flex-wrap items-baseline gap-1">
        <span className="text-[2rem] font-normal leading-none">
          {averageRating.toFixed(1)}
        </span>
        <Star className="size-5 fill-[#222] text-[#222]" aria-hidden />
        <span className="text-sm text-[#595959]">({formattedCount})</span>
      </p>
      <p className="mt-3 text-sm font-semibold">
        {t("shopReviewsAverageLabel")}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[#595959]">
        {t("shopReviewsAverageHelp")}
      </p>
    </div>
  );
}
