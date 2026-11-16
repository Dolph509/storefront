import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import { getSimilarProducts } from "@/lib/data/recommendations";

export async function ProductUpsellBundle({
  productId,
  heading,
  count,
  basePath,
  currency,
}: {
  productId: string;
  heading: string;
  count: number;
  basePath: string;
  currency?: string;
}) {
  const products = (await getSimilarProducts(productId))
    .filter((product) => product.id !== productId)
    .slice(0, Math.max(1, Math.min(12, count)));
  if (!products.length) return null;
  return (
    <ProductRecommendationRail
      title={heading}
      products={products}
      basePath={basePath}
      currency={currency}
      listId={`upsell-bundle-${productId}`}
      listName={heading}
    />
  );
}
