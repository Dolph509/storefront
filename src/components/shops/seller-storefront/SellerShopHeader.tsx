import type { Seller } from "@spree/sdk";
import {
  ChartNoAxesCombined as Sales,
  Plane as VacationMode,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { ContactShopButton } from "@/components/shops/ContactShopButton";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { ShopFollowersButton } from "@/components/shops/ShopFollowersButton";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";
import { SellerShopStat } from "./SellerShopStat";

type SellerProfile = Seller & {
  tagline?: string | null;
  on_vacation?: boolean;
  sellable?: boolean;
  sales_count?: number;
  vacation_announcement?: string | null;
  vacation_announcement_html?: string | null;
};

interface SellerShopHeaderProps {
  seller: SellerProfile;
  basePath: string;
  following: boolean;
  messagingAvailable?: boolean;
  shopPath: string;
  followersCount?: number;
}

export async function SellerShopHeader({
  seller,
  basePath,
  following,
  messagingAvailable = true,
  shopPath,
  followersCount = 0,
}: SellerShopHeaderProps) {
  const t = await getTranslations("sellers");
  const logo = seller.square_logo_url || seller.logo_url;
  const cover = seller.cover_photo_url;
  const onVacation = seller.on_vacation === true;
  const hasReviews =
    seller.average_rating != null && (seller.reviews_count ?? 0) > 0;

  return (
    <header className="bg-white">
      <div className="relative h-52 w-full overflow-hidden bg-[#a86467] sm:h-64 lg:h-[315px]">
        {cover ? (
          // biome-ignore lint/performance/noImgElement: remote seller cover URLs
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#a86467] via-[#d7a6a0] to-[#f4e5dd] text-sm text-white">
            {seller.name}
          </div>
        )}
      </div>

      <div
        className={`${sellerShopShellClass} border-b border-[#e8e3df] bg-white`}
      >
        <div className="flex flex-col gap-4 py-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-3 sm:gap-4">
            <div className="-mt-12 size-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:-mt-14 sm:size-28">
              {logo ? (
                // biome-ignore lint/performance/noImgElement: remote seller logo URLs
                <img src={logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center bg-[#faf8f7] text-lg font-semibold text-[#595959]"
                  aria-hidden
                >
                  {seller.name.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="min-w-0 pt-0.5">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-marketplace-foreground sm:text-4xl">
                {seller.name}
              </h1>
              {seller.tagline ? (
                <p className="mt-0.5 text-sm text-[#595959]">
                  {seller.tagline}
                </p>
              ) : null}
              <dl className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#595959]">
                {hasReviews ? (
                  <div className="flex items-center gap-1 text-[#222]">
                    <StarRatingDisplay
                      rating={seller.average_rating!}
                      size="sm"
                      showValue
                    />
                    <span>({seller.reviews_count!.toLocaleString()})</span>
                  </div>
                ) : (
                  <span>{t("shopNoReviewsYet")}</span>
                )}
                <span className="hidden h-3 w-px bg-[#d9d9d9] sm:inline-block" />
                <SellerShopStat icon={Sales}>
                  {t("salesCount", { count: seller.sales_count ?? 0 })}
                </SellerShopStat>
                <span className="hidden h-3 w-px bg-[#d9d9d9] sm:inline-block" />
                <ShopFollowersButton
                  sellerIdOrSlug={seller.slug ?? seller.id}
                  followersCount={followersCount}
                  variant="header"
                />
              </dl>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <ContactShopButton
              basePath={basePath}
              sellerSlug={seller.slug}
              returnTo={shopPath}
              prominent
              messagingAvailable={messagingAvailable}
            />
            <FollowShopButton
              sellerId={seller.id}
              initialFollowing={following}
              prominent
            />
          </div>
        </div>

        {onVacation ? (
          <div
            role="status"
            className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          >
            <p className="flex items-center gap-2 font-medium">
              <VacationMode className="size-4 shrink-0" aria-hidden />
              {t("vacationTitle")}
            </p>
            {seller.vacation_announcement_html ||
            seller.vacation_announcement ? (
              <div
                className="prose prose-sm mt-1 max-w-none text-amber-900"
                dangerouslySetInnerHTML={{
                  __html:
                    seller.vacation_announcement_html ||
                    seller.vacation_announcement ||
                    "",
                }}
              />
            ) : (
              <p className="mt-1 text-amber-900/90">{t("vacationDefault")}</p>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
