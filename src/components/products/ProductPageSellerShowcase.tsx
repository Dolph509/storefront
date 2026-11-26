import type { Product, ProductReview, Seller } from "@spree/sdk";
import type { LucideIcon } from "lucide-react";
import {
  MailCheck,
  MapPin,
  MessageSquareHeart,
  PackageCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import {
  type MeetTheMakerFollowerSample,
  ProductPageMeetTheMakerAside,
} from "@/components/products/ProductPageMeetTheMakerAside";
import { ProductShopReviewsCarousel } from "@/components/products/ProductShopReviewsCarousel";
import { ContactShopButton } from "@/components/shops/ContactShopButton";
import { ShopFollowersButton } from "@/components/shops/ShopFollowersButton";
import { StarSellerAvatar } from "@/components/shops/StarSellerAvatar";
import {
  getSellerFollowers,
  getSellerProducts,
  getSellerReviews,
  getSellerStorefront,
} from "@/lib/data/sellers";
import { sellerDisplayName } from "@/lib/utils/seller-display";
import { sellerShopPath } from "@/lib/utils/seller-storefront";

const RAIL_LIMIT = 6;

type ProductPageSellerShowcaseProps = {
  seller: Seller;
  products: Product[];
  basePath: string;
  currency?: string;
  excludeProductId?: string;
  messagingAvailable?: boolean;
  hideProductRail?: boolean;
};

function formatStatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

function formatCompactCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(value)
    .replace(/K$/, "k");
}

function mergeRailProducts(
  seeded: Product[],
  catalog: Product[],
  excludeProductId?: string,
): Product[] {
  const seen = new Set<string>();
  const merged: Product[] = [];
  const append = (item: Product) => {
    if (excludeProductId && item.id === excludeProductId) return;
    if (seen.has(item.id)) return;
    seen.add(item.id);
    merged.push(item);
  };
  for (const item of seeded) append(item);
  for (const item of catalog) {
    append(item);
    if (merged.length >= RAIL_LIMIT) break;
  }
  return merged.slice(0, RAIL_LIMIT);
}

export async function ProductPageSellerShowcase({
  seller,
  products,
  basePath,
  currency,
  excludeProductId,
  messagingAvailable = true,
  hideProductRail = false,
}: ProductPageSellerShowcaseProps) {
  const t = await getTranslations("products");
  const tSellers = await getTranslations("sellers");
  const tReviews = await getTranslations("reviews");
  const locale = await getLocale();
  const shopHref = `${basePath}/sellers/${seller.slug}`;

  let following = false;
  let sellerProfile: Seller = seller;
  let followerSamples: MeetTheMakerFollowerSample[] = [];
  let followersCount = seller.followers_count ?? 0;

  try {
    const storefront = await getSellerStorefront(seller.slug);
    following = storefront.following ?? false;
    sellerProfile = {
      ...seller,
      ...storefront.seller,
      badges: storefront.seller.badges ?? seller.badges,
    };
  } catch {
    following = false;
  }
  followersCount = sellerProfile.followers_count ?? followersCount;

  const displayName = sellerDisplayName(sellerProfile.name);
  const hasRating =
    sellerProfile.average_rating != null &&
    (sellerProfile.reviews_count ?? 0) > 0;
  const earnedBadge = (key: string) =>
    sellerProfile.badges?.some(
      (badge) => badge.key === key && badge.awarded_at != null,
    ) ?? false;
  const trustSignals: Array<{
    key: string;
    Icon: LucideIcon;
    title: string;
    description: string;
  }> = [
    ...(earnedBadge("on_time_shipping")
      ? [
          {
            key: "shipping",
            Icon: PackageCheck,
            title: t("makerTrustShippingTitle"),
            description: t("makerTrustShippingBody"),
          },
        ]
      : []),
    ...(earnedBadge("fast_responder")
      ? [
          {
            key: "replies",
            Icon: MailCheck,
            title: t("makerTrustRepliesTitle"),
            description: t("makerTrustRepliesBody"),
          },
        ]
      : []),
    ...(earnedBadge("highly_rated") && hasRating
      ? [
          {
            key: "reviews",
            Icon: MessageSquareHeart,
            title: t("makerTrustReviewsTitle"),
            description: t("makerTrustReviewsBody", {
              rating: sellerProfile.average_rating!.toFixed(1),
              count: formatStatCount(sellerProfile.reviews_count ?? 0, locale),
            }),
          },
        ]
      : []),
  ];

  let catalogProducts: Product[] = [];
  let productsCount = 0;
  let shopReviews: ProductReview[] = [];
  try {
    const catalog = await getSellerProducts(sellerProfile.slug, {
      sellerId: sellerProfile.id,
      limit: RAIL_LIMIT + 4,
    });
    catalogProducts = catalog.data ?? [];
    productsCount = catalog.meta?.count ?? catalogProducts.length;
  } catch {
    catalogProducts = [];
    productsCount = 0;
  }

  if ((sellerProfile.reviews_count ?? 0) > 0) {
    try {
      const reviews = await getSellerReviews(
        sellerProfile.slug,
        1,
        6,
        "newest",
      );
      shopReviews = reviews.data ?? [];
    } catch {
      shopReviews = [];
    }
  }

  try {
    const followersPage = await getSellerFollowers(sellerProfile.slug, 1, 3);
    followersCount = followersPage.meta?.count ?? followersCount;
    followerSamples = followersPage.data.map((follow) => ({
      id: follow.id,
      label:
        follow.customer_name?.trim() || tSellers("followersDialogAnonymous"),
    }));
  } catch {
    followerSamples = [];
  }

  const railProducts = mergeRailProducts(
    products,
    catalogProducts,
    excludeProductId,
  );
  const showMoreFromMakerSection =
    !hideProductRail && (productsCount > 1 || railProducts.length > 0);
  const sellerReviewsHref = sellerShopPath(
    basePath,
    sellerProfile.slug,
    "reviews",
  );
  const reviewerCount = sellerProfile.reviews_count ?? 0;

  return (
    <MarketplaceSection data-pdp-discovery-section="seller-showcase">
      <MarketplacePage className="bg-transparent">
        <section className="border-y border-[#e2ddd8] py-5 sm:py-7">
          <h2 className="mb-3.5 text-xs font-semibold uppercase tracking-[0.06em] text-[#716a68] md:hidden">
            {t("meetTheMaker")}
          </h2>
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-5">
            <div className="flex min-w-0 flex-row items-center gap-3.5 text-left md:gap-5">
              <StarSellerAvatar
                seller={sellerProfile}
                href={shopHref}
                sizeClassName="size-16 sm:size-[84px] md:size-[92px]"
                imageSizes="92px"
              />

              <div className="flex min-w-0 flex-1 flex-col items-start">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Link
                    href={shopHref}
                    className="font-display text-lg leading-tight text-[#39343c] hover:underline sm:text-2xl"
                  >
                    {displayName}
                  </Link>
                </div>
                {sellerProfile.ships_from ? (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#716a68] sm:mt-1 sm:text-sm">
                    <MapPin aria-hidden className="size-3.5" />
                    {sellerProfile.ships_from}
                  </p>
                ) : null}
                {sellerProfile.tagline ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-[#716a68] sm:mt-1 sm:text-sm">
                    {sellerProfile.tagline}
                  </p>
                ) : null}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#39343c] sm:mt-1.5 sm:text-sm">
                  {hasRating ? (
                    <span className="inline-flex items-center gap-1">
                      <Star
                        aria-hidden
                        className="size-3.5 fill-[#39343c] text-[#39343c] sm:size-4"
                      />
                      <strong>
                        {sellerProfile.average_rating!.toFixed(1)}
                      </strong>
                      <span className="text-[#716a68]">
                        ({formatCompactCount(reviewerCount, locale)})
                      </span>
                    </span>
                  ) : null}
                  {hasRating && sellerProfile.sales_count > 0 ? (
                    <span aria-hidden="true" className="text-[#c8c0ba]">
                      ·
                    </span>
                  ) : null}
                  {sellerProfile.sales_count > 0 ? (
                    <span>
                      {formatCompactCount(sellerProfile.sales_count, locale)}{" "}
                      {t("makerSalesSuffix")}
                    </span>
                  ) : null}
                  {hasRating || sellerProfile.sales_count > 0 ? (
                    <span className="text-[#c8c0ba]" aria-hidden="true">
                      ·
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1 text-[#716a68]">
                    <ShopFollowersButton
                      sellerIdOrSlug={sellerProfile.slug}
                      followersCount={followersCount}
                      variant="stat"
                    />
                    {t("makerStatFollowers").toLowerCase()}
                  </span>
                </div>
                {trustSignals.length > 0 ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {trustSignals.map(({ key, Icon, title, description }) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 text-xs leading-4 text-[#716a68]"
                        role="img"
                        aria-label={`${title}: ${description}`}
                        title={`${title}: ${description}`}
                      >
                        <Icon
                          aria-hidden
                          className="size-3.5 shrink-0 text-[#39343c]"
                          strokeWidth={2.1}
                        />
                        <span className="font-medium text-[#39343c]">
                          {title}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col items-stretch gap-2 md:w-auto md:items-end">
              <ProductPageMeetTheMakerAside
                sellerId={sellerProfile.id}
                sellerSlug={sellerProfile.slug}
                initialFollowing={following}
                initialFollowersCount={followersCount}
                followerSamples={followerSamples}
                inline
                afterFollow={
                  <ContactShopButton
                    basePath={basePath}
                    sellerSlug={sellerProfile.slug}
                    sellerName={sellerProfile.name}
                    sellerLogoUrl={
                      sellerProfile.square_logo_url ?? sellerProfile.logo_url
                    }
                    messagingAvailable={messagingAvailable}
                    className="!h-10 flex-1 !justify-center !rounded-full !border-[#39343c] !bg-white !px-4 !text-xs !font-semibold !text-[#39343c] !shadow-none hover:!bg-[#f7f4f1] md:!h-11 md:flex-none md:!min-w-40 md:!px-5"
                  />
                }
              />
            </div>
          </header>

          {shopReviews.length > 0 ? (
            <section
              id="maker-shop-reviews"
              className="mt-7 border-t border-[#e2ddd8] pt-6"
              aria-labelledby="maker-shop-reviews-heading"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2
                  id="maker-shop-reviews-heading"
                  className="text-base font-semibold text-[#39343c] sm:text-lg"
                >
                  {t("makerShopReviewsHeading", {
                    count: formatCompactCount(reviewerCount, locale),
                  })}
                </h2>
                <Link
                  href={sellerReviewsHref}
                  className="shrink-0 rounded-full border border-[#39343c] px-4 py-2 text-xs font-semibold text-[#39343c] transition-colors hover:bg-marketplace-accent"
                >
                  {t("makerShowAllReviews")}
                </Link>
              </div>
              <ProductShopReviewsCarousel
                reviews={shopReviews}
                basePath={basePath}
                locale={locale}
                anonymousReviewer={tReviews("anonymousReviewer")}
                purchasedLabel={t("makerPurchasedLabel")}
                previousLabel={tReviews("previousPage")}
                nextLabel={tReviews("nextPage")}
              />
            </section>
          ) : null}

          {showMoreFromMakerSection ? (
            <section className="mt-7 border-t border-[#e2ddd8] pt-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-[#39343c] sm:text-lg">
                  {t("moreFromThisMaker")}
                </h2>
                <Link
                  href={shopHref}
                  className="shrink-0 text-xs font-semibold text-[#39343c] underline underline-offset-4 hover:text-[#5e5144]"
                >
                  {t("makerVisitShop")}
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
              {railProducts.length > 0 ? (
                <ProductCarousel
                  products={railProducts}
                  basePath={basePath}
                  currency={currency}
                  listId="seller-shop-products"
                  listName="More from maker"
                  sellerShopDiscovery={{
                    sellerId: sellerProfile.id,
                    listId: "seller-shop-products",
                    section: "product-page-showcase",
                  }}
                  mobileSlidesPerView={2}
                />
              ) : (
                <Link
                  href={shopHref}
                  className="flex min-h-28 items-center justify-center rounded-sm border border-dashed border-[#d8d4cc] text-sm font-medium text-[#39343c] hover:underline"
                >
                  {productsCount > 0
                    ? t("sellerShowcaseBrowse", { count: productsCount })
                    : t("visitStore")}
                </Link>
              )}
            </section>
          ) : null}
        </section>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
