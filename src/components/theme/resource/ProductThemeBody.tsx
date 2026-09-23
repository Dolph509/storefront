import { ProductDetails } from "@/app/[country]/[locale]/(storefront)/products/[slug]/ProductDetails";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { ProductPageRecommendations } from "@/components/products/ProductPageRecommendations";
import { ProductReviewsSection } from "@/components/reviews/ProductReviewsSection";
import type { ProductThemeContext } from "@/lib/theme/types";

export function ProductThemeBody({
  context,
}: {
  context: ProductThemeContext;
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
