import type { Product } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { Button } from "@/components/ui/button";

export type RecommendationSource =
  | "similar"
  | "shop"
  | "trending"
  | "new"
  | "followed_shops";

interface ProductRecommendationRailProps {
  title: string;
  products: Product[];
  basePath: string;
  currency?: string;
  listId: string;
  listName: string;
  moreHref?: string;
  moreLabel?: string;
}

export async function ProductRecommendationRail({
  title,
  products,
  basePath,
  currency,
  listId,
  listName,
  moreHref,
  moreLabel,
}: ProductRecommendationRailProps) {
  if (!products.length) return null;

  const t = await getTranslations("home");

  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {moreHref ? (
          <Button variant="link" asChild>
            <Link href={moreHref}>{moreLabel ?? `${t("viewAll")} →`}</Link>
          </Button>
        ) : null}
      </div>
      <ProductCarousel
        products={products}
        basePath={basePath}
        currency={currency}
        listId={listId}
        listName={listName}
      />
    </section>
  );
}
