import type { Product } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketplaceEmptyState } from "@/components/marketplace";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getProductsByIds } from "@/lib/data/products";
import type { SellerShopSection } from "@/lib/data/seller-storefront-types";
import { getSellerProducts, getSellerReviews } from "@/lib/data/sellers";
import { sellerShopSectionListId } from "@/lib/discovery-context";
import {
  sellerShopPath,
  sellerShopShellClass,
} from "@/lib/utils/seller-storefront";
import { SellerProductRail } from "./SellerProductRail";
import { SellerShopReviewCard } from "./SellerShopReviewCard";

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
  sellable?: boolean;
  onVacation?: boolean;
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
}: SellerStorefrontHomeProps) {
  const t = await getTranslations("sellers");
  const activeSections = sections.filter((s) => s.active);

  const [featuredProducts, bestPage, newPage, salePage, personalizedPage] =
    await Promise.all([
      // Resolve featured by id — do not depend on whatever happens to land in
      // the first page of the seller catalog (order/filters can omit them).
      featuredIds.length
        ? getProductsByIds(featuredIds.slice(0, 12))
        : Promise.resolve([] as Product[]),
      getSellerProducts(slug, { sellerId, limit: 8, sort: "best_selling" }),
      getSellerProducts(slug, {
        sellerId,
        limit: 8,
        sort: "available_on_desc",
      }),
      getSellerProducts(slug, {
        sellerId,
        limit: 8,
        q: { on_sale: true },
      }).catch(() => ({ data: [] as Product[], meta: { count: 0 } })),
      getSellerProducts(slug, {
        sellerId,
        limit: 8,
        q: { personalizable: true },
      }).catch(() => ({ data: [] as Product[], meta: { count: 0 } })),
    ]);
  const featuredPage = {
    data: featuredProducts,
    meta: { count: featuredProducts.length },
  };

  const sectionPreviews = await Promise.all(
    activeSections.slice(0, 4).map(async (section) => {
      const page = await getSellerProducts(slug, {
        sellerId,
        section: section.slug,
        limit: 4,
      });
      return { section, products: page.data };
    }),
  );

  const reviewsPreview =
    reviewsCount > 0
      ? await getSellerReviews(slug, 1, 3).catch(() => ({
          data: [],
          meta: { count: 0, pages: 1 },
        }))
      : { data: [], meta: { count: 0, pages: 1 } };

  const aboutPreview = about?.trim()
    ? about.length > 220
      ? `${about.slice(0, 217)}…`
      : about
    : aboutHtml
      ? aboutHtml.replace(/<[^>]+>/g, "").slice(0, 220)
      : null;

  const hasRails =
    featuredPage.data.length > 0 ||
    sectionPreviews.some((s) => s.products.length > 0) ||
    bestPage.data.length > 0 ||
    newPage.data.length > 0 ||
    salePage.data.length > 0 ||
    personalizedPage.data.length > 0 ||
    reviewsPreview.data.length > 0 ||
    Boolean(aboutPreview);

  if (!hasRails) {
    return (
      <div className={`${sellerShopShellClass} py-12`}>
        <MarketplaceEmptyState
          illustration="no-listings-yet"
          title={t("emptyShopTitle")}
          description={t("emptyShopBody")}
        />
      </div>
    );
  }

  return (
    <div className={`${sellerShopShellClass} py-8`}>
      {featuredPage.data.length > 0 ? (
        <SellerProductRail
          title={t("featuredTitle")}
          products={featuredPage.data}
          basePath={basePath}
          sellerId={sellerId}
          listId="seller-shop-featured"
          moreHref={sellerShopPath(basePath, slug, "products")}
        />
      ) : null}

      {sectionPreviews.map(({ section, products }) =>
        products.length ? (
          <section
            key={section.id}
            className="border-b border-marketplace-border-subtle py-10"
          >
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-xl font-semibold text-marketplace-foreground">
                {section.name}
              </h2>
              <Link
                href={sellerShopPath(basePath, slug, "products", {
                  section: section.slug,
                })}
                className="text-sm font-medium text-marketplace-brand hover:underline"
              >
                {t("viewAll")}
              </Link>
            </div>
            <ProductGrid
              products={products}
              basePath={basePath}
              listId={sellerShopSectionListId(section.slug)}
              listName={section.name}
              density="compact"
              sellerShopDiscovery={{
                sellerId,
                listId: sellerShopSectionListId(section.slug),
                section: section.slug,
              }}
            />
          </section>
        ) : null,
      )}

      <SellerProductRail
        title={t("bestSellersTitle")}
        products={bestPage.data}
        basePath={basePath}
        sellerId={sellerId}
        listId="seller-shop-best-sellers"
        moreHref={sellerShopPath(basePath, slug, "products", {
          sort: "best_selling",
        })}
      />

      <SellerProductRail
        title={t("newArrivalsTitle")}
        products={newPage.data}
        basePath={basePath}
        sellerId={sellerId}
        listId="seller-shop-new"
        moreHref={sellerShopPath(basePath, slug, "products", {
          sort: "available_on_desc",
        })}
      />

      {personalizedPage.data.length > 0 ? (
        <SellerProductRail
          title={t("personalizedTitle")}
          products={personalizedPage.data}
          basePath={basePath}
          sellerId={sellerId}
          listId="seller-shop-personalized"
          moreHref={sellerShopPath(basePath, slug, "products", {
            personalizable: "1",
          })}
        />
      ) : null}

      {salePage.data.length > 0 ? (
        <SellerProductRail
          title={t("onSaleTitle")}
          products={salePage.data}
          basePath={basePath}
          sellerId={sellerId}
          listId="seller-shop-sale"
          moreHref={sellerShopPath(basePath, slug, "products", { sale: "1" })}
        />
      ) : null}

      {reviewsPreview.data.length > 0 ? (
        <section className="border-b border-marketplace-border-subtle py-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-semibold text-marketplace-foreground">
              {t("tab_reviews")}
            </h2>
            <Link
              href={sellerShopPath(basePath, slug, "reviews")}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="divide-y divide-marketplace-border-subtle">
            {reviewsPreview.data.map((review) => (
              <SellerShopReviewCard
                key={review.id}
                review={review}
                locale={locale}
                basePath={basePath}
              />
            ))}
          </div>
        </section>
      ) : null}

      {aboutPreview ? (
        <section className="py-10">
          <h2 className="text-xl font-semibold text-marketplace-foreground">
            {t("tab_about")}
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-marketplace-muted-foreground">
            {aboutPreview}
          </p>
          <Link
            href={sellerShopPath(basePath, slug, "about")}
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            {t("readMore")}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
