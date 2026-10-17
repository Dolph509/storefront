import type { Policy, Seller } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketplaceEmptyState } from "@/components/marketplace";
import { SellerShopAnnouncement } from "@/components/shops/seller-storefront/SellerShopAnnouncement";
import type {
  SellerShopPagePayload,
  SellerShopSection,
} from "@/lib/data/seller-storefront-types";
import { getSellerProducts, getSellerReviews } from "@/lib/data/sellers";
import { buildAccountLoginHref } from "@/lib/utils/account-redirect";
import {
  sellerShopPath,
  sellerShopShellClass,
} from "@/lib/utils/seller-storefront";
import { SellerPersonalizedDiscoveryRail } from "./SellerPersonalizedDiscoveryRail";
import { SellerShopRatingSummary } from "./SellerShopRatingSummary";
import { SellerShopReviewCard } from "./SellerShopReviewCard";
import { SellerStorefrontAbout } from "./SellerStorefrontAbout";
import { SellerStorefrontPolicies } from "./SellerStorefrontPolicies";
import { SellerStorefrontProducts } from "./SellerStorefrontProducts";

interface SellerStorefrontHomeProps {
  slug: string;
  basePath: string;
  locale: string;
  sellerId: string;
  sections: SellerShopSection[];
  featuredIds: string[];
  aboutHtml?: string | null;
  about?: string | null;
  reviewsCount: number;
  featuredLayout?: "standard" | "mixed_grid";
  productCount?: number;
  policies?: Policy[];
  marketplaceName?: string;
  seller?: Seller;
  sellable?: boolean;
  onVacation?: boolean;
  page?: number;
  section?: string;
  query?: string;
  sort?: string;
  onSale?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  personalizable?: string;
  salesCount?: number;
  followersCount?: number;
  customOrderHref?: string;
  shopPath?: string;
  shopAnnouncement?: string | null;
  shopAnnouncementHtml?: string | null;
  editorPreview?: boolean;
  shopPage?: SellerShopPagePayload | null;
}

export async function SellerStorefrontHome({
  slug,
  basePath,
  locale,
  sellerId,
  sections,
  featuredIds,
  aboutHtml,
  about,
  reviewsCount,
  featuredLayout = "standard",
  productCount,
  policies = [],
  marketplaceName = "",
  seller,
  page = 1,
  section,
  query,
  sort,
  onSale,
  minPrice,
  maxPrice,
  minRating,
  personalizable,
  salesCount,
  followersCount,
  customOrderHref,
  shopPath = `${basePath}/sellers/${slug}`,
  shopAnnouncement,
  shopAnnouncementHtml,
  editorPreview = false,
  shopPage,
}: SellerStorefrontHomeProps) {
  const t = await getTranslations("sellers");
  const tReviews = await getTranslations("reviews");
  const catalogCount =
    productCount ??
    (await getSellerProducts(slug, { sellerId, page: 1, limit: 1 })
      .then((result) => result.meta.count ?? 0)
      .catch(() => 0));
  const reviews =
    reviewsCount > 0
      ? await getSellerReviews(slug, 1, 10).catch(() => ({ data: [] }))
      : { data: [] };
  const hasAnnouncement = Boolean(
    shopAnnouncementHtml?.trim() || shopAnnouncement?.trim(),
  );

  return (
    <>
      {hasAnnouncement ? (
        <div id="shop-announcement">
          <SellerShopAnnouncement
            shopAnnouncement={shopAnnouncement}
            shopAnnouncementHtml={shopAnnouncementHtml}
          />
        </div>
      ) : null}

      {catalogCount > 0 ? (
        <>
          <SellerStorefrontProducts
            slug={slug}
            sellerId={sellerId}
            basePath={basePath}
            locale={locale}
            sections={sections}
            featuredIds={featuredIds}
            featuredLayout={featuredLayout}
            page={page}
            section={section}
            query={query}
            sort={sort}
            onSale={onSale}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minRating={minRating}
            personalizable={personalizable}
            totalItemCount={catalogCount}
            salesCount={salesCount}
            followersCount={followersCount}
            customOrderHref={customOrderHref}
            shopPath={shopPath}
            marketplaceName={marketplaceName}
            editorPreview={editorPreview}
          />
          {page === 1 &&
          !section &&
          !query &&
          !onSale &&
          !minPrice &&
          !maxPrice &&
          !minRating &&
          !personalizable ? (
            <SellerPersonalizedDiscoveryRail
              sellerId={sellerId}
              slug={slug}
              basePath={basePath}
              locale={locale}
              excludeProductIds={featuredIds}
            />
          ) : null}
        </>
      ) : (
        <div className={`${sellerShopShellClass} py-12`} id="shop-items">
          <MarketplaceEmptyState
            illustration="no-listings-yet"
            title={t("emptyShopTitle")}
            description={t("emptyShopBody")}
          />
        </div>
      )}

      <section
        id="shop-reviews"
        className={`${sellerShopShellClass} border-t border-[#e3ddd8] bg-[#faf9f7] py-7`}
      >
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-[#e8e3df] pb-3">
          <div>
            <h2 className="text-lg font-semibold text-marketplace-foreground">
              {t("tab_reviews")}
            </h2>
            <p className="mt-1 text-sm text-marketplace-muted-foreground">
              {tReviews("reviewCount", { count: reviewsCount })}
            </p>
          </div>
          {reviewsCount > reviews.data.length ? (
            <Link
              href={sellerShopPath(basePath, slug, "reviews")}
              className="shrink-0 text-sm font-medium text-marketplace-foreground underline underline-offset-4 hover:text-marketplace-brand"
            >
              {t("viewAll")}
            </Link>
          ) : null}
        </div>
        {reviews.data.length ? (
          <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
            <aside className="border-b border-[#e8e3df] pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
              <SellerShopRatingSummary
                locale={locale}
                averageRating={seller?.average_rating ?? null}
                reviewsCount={reviewsCount}
              />
            </aside>
            <div className="divide-y divide-marketplace-border-subtle">
              {reviews.data.slice(0, 5).map((review) => (
                <SellerShopReviewCard
                  key={review.id}
                  review={review}
                  locale={locale}
                  basePath={basePath}
                  reportLoginHref={buildAccountLoginHref(
                    basePath,
                    sellerShopPath(basePath, slug, "reviews"),
                  )}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-marketplace-muted-foreground">
            {t("noReviews")}
          </p>
        )}
      </section>

      <div
        id="shop-about"
        className="border-t border-marketplace-border-subtle"
      >
        <SellerStorefrontAbout
          shopName={seller?.name ?? slug}
          marketplaceName={marketplaceName}
          sellerSince={seller?.seller_since}
          tagline={seller?.tagline}
          aboutHtml={aboutHtml}
          about={about}
          salesCount={salesCount}
          shopPage={shopPage}
          editorPreview={editorPreview}
        />
      </div>

      <div
        id="shop-policies"
        className="border-t border-marketplace-border-subtle"
      >
        <SellerStorefrontPolicies
          policies={policies}
          marketplaceName={marketplaceName}
          seller={seller}
          editorPreview={editorPreview}
        />
      </div>
    </>
  );
}
