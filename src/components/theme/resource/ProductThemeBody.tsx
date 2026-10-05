import type { ReactNode } from "react";
import { ProductDetails } from "@/app/[country]/[locale]/(storefront)/products/[slug]/ProductDetails";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { ProductPageRecommendations } from "@/components/products/ProductPageRecommendations";
import { RecentlyViewedProducts } from "@/components/products/RecentlyViewedProducts";
import { ProductReviewsSection } from "@/components/reviews/ProductReviewsSection";
import { getCategoryProducts } from "@/lib/data/categories";
import { themeSettingEnabled } from "@/lib/theme/setting-value";
import type { ProductThemeContext } from "@/lib/theme/types";

export async function ProductThemeBody({
  context,
  sectionSettings = {},
  themeSettings = {},
  productBlocks,
  productMediaSettings,
  productMediaBlockId,
  productBlocksActive = false,
  productDescriptionBlockPresent = false,
  productPersonalizationBlockPresent = false,
  documentDriven = false,
  showTemplateRelated = true,
  showTemplateRecommended = true,
  showTemplateRecentlyViewed = true,
}: {
  context: ProductThemeContext;
  sectionSettings?: Record<string, unknown>;
  themeSettings?: { product_page?: Record<string, string | boolean> };
  productBlocks?: ReactNode[];
  productMediaSettings?: Record<string, unknown>;
  productMediaBlockId?: string;
  productBlocksActive?: boolean;
  productDescriptionBlockPresent?: boolean;
  productPersonalizationBlockPresent?: boolean;
  documentDriven?: boolean;
  showTemplateRelated?: boolean;
  showTemplateRecommended?: boolean;
  showTemplateRecentlyViewed?: boolean;
}) {
  const {
    product,
    basePath,
    locale,
    reviewSort = "newest",
    categoryId,
  } = context;
  const breadcrumbCategory = product.categories?.find((category) =>
    categoryId ? category.id === categoryId : true,
  );
  let productNavigation:
    | {
        previous?: { name: string; slug: string };
        next?: { name: string; slug: string };
      }
    | undefined;
  const navigationCategoryId = categoryId || breadcrumbCategory?.id;
  if (
    themeSettingEnabled(sectionSettings.product_navigation) &&
    navigationCategoryId
  ) {
    try {
      const response = await getCategoryProducts(navigationCategoryId, {
        limit: 100,
        sort: "name",
      });
      const products = response.data || [];
      const currentIndex = products.findIndex((item) => item.id === product.id);
      if (currentIndex >= 0) {
        const previous = products[currentIndex - 1];
        const next = products[currentIndex + 1];
        productNavigation = {
          ...(previous
            ? { previous: { name: previous.name, slug: previous.slug } }
            : {}),
          ...(next ? { next: { name: next.name, slug: next.slug } } : {}),
        };
      }
    } catch {
      productNavigation = undefined;
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {breadcrumbCategory && (
          <Breadcrumbs
            category={breadcrumbCategory}
            basePath={basePath}
            productName={product.name}
            locale={locale}
          />
        )}
      </div>
      <ProductDetails
        product={product}
        basePath={basePath}
        cartDiscovery={context.cartDiscovery}
        appearance={{
          ...sectionSettings,
          gallery_style:
            sectionSettings.gallery_layout === "thumbnails_bottom"
              ? "thumbnails_bottom"
              : "thumbnails_left",
          layout:
            sectionSettings.section_width === "full" ? "wide" : "standard",
          sticky_info: sectionSettings.sticky_info,
          product_media_width: sectionSettings.media_width,
          product_desktop_spacing: sectionSettings.desktop_spacing,
          product_mobile_spacing: sectionSettings.mobile_spacing,
        }}
        globalSettings={themeSettings.product_page}
        productNavigation={productNavigation}
        templateBlocks={productBlocksActive ? productBlocks || [] : undefined}
        templateDescriptionBlockPresent={productDescriptionBlockPresent}
        templatePersonalizationBlockPresent={productPersonalizationBlockPresent}
        templateMediaSettings={productMediaSettings}
        templateMediaBlockId={productMediaBlockId}
      >
        {!documentDriven &&
        !productBlocksActive &&
        themeSettingEnabled(themeSettings.product_page?.show_reviews, true) &&
        themeSettingEnabled(sectionSettings.show_reviews, true) ? (
          <ProductReviewsSection
            product={product}
            locale={locale}
            sort={reviewSort}
            embedded
          />
        ) : null}
      </ProductDetails>
      {!documentDriven &&
      productBlocksActive &&
      themeSettingEnabled(themeSettings.product_page?.show_reviews, true) &&
      themeSettingEnabled(sectionSettings.show_reviews, true) ? (
        <ProductReviewsSection
          product={product}
          locale={locale}
          sort={reviewSort}
        />
      ) : null}
      {!documentDriven &&
      ((showTemplateRelated &&
        themeSettingEnabled(themeSettings.product_page?.show_related, true)) ||
        (showTemplateRecommended &&
          themeSettingEnabled(
            themeSettings.product_page?.show_recommended,
            true,
          ))) ? (
        <ProductPageRecommendations
          productId={product.id}
          sellerName={product.seller?.name ?? product.seller_name}
          basePath={basePath}
          currency={product.price?.currency ?? undefined}
          locale={locale}
          showRelated={
            showTemplateRelated &&
            themeSettingEnabled(themeSettings.product_page?.show_related, true)
          }
          showRecommended={
            showTemplateRecommended &&
            themeSettingEnabled(
              themeSettings.product_page?.show_recommended,
              true,
            )
          }
        />
      ) : null}
      {!documentDriven &&
      showTemplateRecentlyViewed &&
      themeSettingEnabled(themeSettings.product_page?.show_recently_viewed) ? (
        <RecentlyViewedProducts
          productId={product.id}
          basePath={basePath}
          currency={product.price?.currency ?? undefined}
        />
      ) : null}
    </>
  );
}
