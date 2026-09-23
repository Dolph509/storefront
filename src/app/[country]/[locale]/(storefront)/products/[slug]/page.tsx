import type { Category } from "@spree/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { ProductPageRecommendations } from "@/components/products/ProductPageRecommendations";
import { ProductReviewsSection } from "@/components/reviews/ProductReviewsSection";
import type { ProductReviewSort } from "@/components/reviews/ProductReviewsSort";
import { JsonLd } from "@/components/seo/JsonLd";
import { ThemePageRenderer } from "@/components/theme/ThemePageRenderer";
import { getCachedProduct, PRODUCT_PAGE_EXPAND } from "@/lib/data/cached";
import { generateProductMetadata } from "@/lib/metadata/product";
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildProductJsonLd,
} from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";
import { themeTemplateProductEnabled } from "@/lib/theme/flags";
import { getActiveTheme, getResolvedTemplate } from "@/lib/theme/resolver";
import type { ProductThemeContext } from "@/lib/theme/types";
import { ProductDetails } from "./ProductDetails";

interface ProductPageProps {
  params: Promise<{
    country: string;
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<{
    category_id?: string;
    review_sort?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { country, locale, slug } = await params;
  return generateProductMetadata({ country, locale, slug });
}

function findBreadcrumbCategory(
  categories: Category[],
  categoryId?: string,
): Category | undefined {
  if (categories.length === 0) return undefined;
  if (categoryId) {
    const match = categories.find((c) => c.id === categoryId);
    if (match) return match;
  }
  return categories[0];
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { country, locale, slug } = await params;
  const { category_id, review_sort } = await searchParams;
  const reviewSort: ProductReviewSort =
    review_sort === "highest" || review_sort === "lowest"
      ? review_sort
      : "newest";
  const basePath = `/${country}/${locale}`;

  let product;
  try {
    product = await getCachedProduct(slug, PRODUCT_PAGE_EXPAND);
  } catch {
    notFound();
  }

  const storeUrl = getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(
        storeUrl,
        `/${country}/${locale}/products/${product.slug}`,
      )
    : undefined;

  const breadcrumbCategory = findBreadcrumbCategory(
    product.categories || [],
    category_id,
  );

  if (themeTemplateProductEnabled()) {
    const [theme, template] = await Promise.all([
      getActiveTheme(),
      getResolvedTemplate({
        templateType: "product",
        templateKey: "default",
        resourceType: "Spree::Product",
        resourceId: product.id,
      }),
    ]);
    if (theme && template) {
      const context: ProductThemeContext = {
        kind: "product",
        product,
        basePath,
        locale,
        country,
        reviewSort,
        categoryId: category_id,
      };
      return (
        <>
          {canonicalUrl && (
            <JsonLd data={buildProductJsonLd(product, canonicalUrl)} />
          )}
          {breadcrumbCategory && storeUrl && (
            <JsonLd
              data={buildBreadcrumbJsonLd(
                breadcrumbCategory,
                basePath,
                storeUrl,
                {
                  name: product.name,
                  slug: product.slug,
                },
              )}
            />
          )}
          <ThemePageRenderer
            theme={theme}
            template={template}
            context={context}
          />
        </>
      );
    }
  }

  return (
    <>
      {canonicalUrl && (
        <JsonLd data={buildProductJsonLd(product, canonicalUrl)} />
      )}
      {breadcrumbCategory && storeUrl && (
        <JsonLd
          data={buildBreadcrumbJsonLd(breadcrumbCategory, basePath, storeUrl, {
            name: product.name,
            slug: product.slug,
          })}
        />
      )}
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
      <ProductDetails product={product} basePath={basePath} />
      <ProductReviewsSection
        product={product}
        locale={locale}
        sort={reviewSort}
      />
      <ProductPageRecommendations
        productId={product.id}
        sellerName={product.seller?.name ?? product.seller_name}
        basePath={basePath}
        currency={product.price?.currency}
        locale={locale}
      />
    </>
  );
}
