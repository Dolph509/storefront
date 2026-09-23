import { LayoutGrid } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { SellerShopSection } from "@/lib/data/seller-storefront-types";
import { getSellerProducts } from "@/lib/data/sellers";
import {
  buildSellerShopProductQuery,
  orderProductsByIds,
  sellerShopPath,
  sellerShopShellClass,
} from "@/lib/utils/seller-storefront";
import { SellerShopProductFilters } from "./SellerShopProductFilters";
import { SellerShopSidebar } from "./SellerShopSidebar";
import { SellerShopSortForm } from "./SellerShopSortForm";

interface SellerStorefrontProductsProps {
  slug: string;
  sellerId: string;
  basePath: string;
  sections: SellerShopSection[];
  featuredIds: string[];
  page: number;
  section?: string;
  query?: string;
  sort?: string;
  onSale?: string;
  shopPath: string;
  totalItemCount: number;
  salesCount?: number;
  followersCount?: number;
  customOrderHref?: string;
  marketplaceName: string;
}

export async function SellerStorefrontProducts({
  slug,
  sellerId,
  basePath,
  sections,
  featuredIds,
  page,
  section,
  query,
  sort,
  onSale,
  totalItemCount,
  salesCount,
  followersCount,
  customOrderHref,
  shopPath,
  marketplaceName,
}: SellerStorefrontProductsProps) {
  const t = await getTranslations("sellers");
  const catalogQuery = buildSellerShopProductQuery({
    textQuery: query,
    onSale,
  });

  const products = await getSellerProducts(slug, {
    sellerId,
    page,
    limit: 48,
    section,
    sort: sort || undefined,
    q: catalogQuery,
  });

  const shopProductsPath = sellerShopPath(basePath, slug, "products");

  const showFeatured =
    page === 1 && !section && !query && !onSale && featuredIds.length > 0;
  const featuredProducts = showFeatured
    ? orderProductsByIds(
        (
          await getSellerProducts(slug, {
            sellerId,
            limit: Math.min(featuredIds.length + 4, 24),
          })
        ).data,
        featuredIds,
      ).slice(0, 8)
    : [];

  const sectionTitle = section
    ? (sections.find((s) => s.slug === section)?.name ?? t("tab_products"))
    : t("allItemsHeading");

  return (
    <div className="bg-white pb-12 pt-7">
      <div className={sellerShopShellClass}>
        <div className="md:grid md:grid-cols-[minmax(11rem,13rem)_minmax(0,1fr)] md:gap-6 lg:gap-8 xl:gap-10">
          <SellerShopSidebar
            slug={slug}
            basePath={basePath}
            sections={sections}
            activeSection={section}
            totalItemCount={totalItemCount}
            salesCount={salesCount}
            followersCount={followersCount}
            customOrderHref={customOrderHref}
            shopPath={shopPath}
            sellerId={sellerId}
            sellerSlug={slug}
            marketplaceName={marketplaceName}
          />

          <div className="min-w-0 md:pt-0">
            {featuredProducts.length > 0 ? (
              <section className="mb-10">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-base font-semibold text-[#222]">
                    {t("featuredTitle")}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <SellerShopProductFilters
                      action={shopProductsPath}
                      section={section}
                      query={query}
                      sort={sort}
                      onSale={onSale}
                    />
                    <SellerShopSortForm
                      action={shopProductsPath}
                      section={section}
                      query={query}
                      sort={sort}
                      onSale={onSale}
                    />
                  </div>
                </div>
                <ProductGrid
                  products={featuredProducts}
                  basePath={basePath}
                  listId="seller-shop-featured"
                  listName={t("featuredTitle")}
                  density="compact"
                  sellerShopDiscovery={{
                    sellerId,
                    listId: "seller-shop-featured",
                  }}
                />
              </section>
            ) : null}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[#222]">
                <LayoutGrid className="size-5 text-[#6b5f5a]" aria-hidden />
                {sectionTitle}
              </h2>
              {featuredProducts.length === 0 ? (
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <SellerShopProductFilters
                    action={shopProductsPath}
                    section={section}
                    query={query}
                    sort={sort}
                    onSale={onSale}
                  />
                  <SellerShopSortForm
                    action={shopProductsPath}
                    section={section}
                    query={query}
                    sort={sort}
                    onSale={onSale}
                  />
                </div>
              ) : null}
            </div>

            <ProductGrid
              products={products.data}
              basePath={basePath}
              listId={query ? "seller-shop-search" : "seller-shop-products"}
              listName={t("tab_products")}
              emptyMessage={t("noProducts")}
              density="compact"
              sellerShopDiscovery={{
                sellerId,
                listId: query ? "seller-shop-search" : "seller-shop-products",
                section,
              }}
            />

            {products.meta.pages > 1 ? (
              <nav
                className="mt-10 flex justify-center gap-4"
                aria-label={t("productPages")}
              >
                {page > 1 ? (
                  <a
                    className="text-sm font-medium text-[#222] underline"
                    href={sellerShopPath(basePath, slug, "products", {
                      page: String(page - 1),
                      section,
                      q: query,
                      sort,
                      sale: onSale,
                    })}
                  >
                    {t("previous")}
                  </a>
                ) : null}
                <span className="text-sm text-[#757575]">
                  {t("pageOf", { page, pages: products.meta.pages })}
                </span>
                {page < products.meta.pages ? (
                  <a
                    className="text-sm font-medium text-[#222] underline"
                    href={sellerShopPath(basePath, slug, "products", {
                      page: String(page + 1),
                      section,
                      q: query,
                      sort,
                      sale: onSale,
                    })}
                  >
                    {t("next")}
                  </a>
                ) : null}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
