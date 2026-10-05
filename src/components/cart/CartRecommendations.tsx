"use client";

import type { Product } from "@spree/sdk";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { FeaturedCollectionQuickAdd } from "@/components/products/FeaturedCollectionQuickAdd";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { getProduct, getProducts } from "@/lib/data/products";
import {
  getMoreFromShopProducts,
  getNewArrivalProducts,
  getSimilarProducts,
  getTrendingProducts,
} from "@/lib/data/recommendations";

const SECTION_LIMIT = 10;

function isUsableCard(product: Product): boolean {
  if (!product?.slug || !product?.name) return false;
  return Boolean(
    product.price?.display_amount ||
      (product.price?.amount != null && product.price.amount !== ""),
  );
}

function takeUnique(
  products: Product[],
  excluded: Set<string>,
  limit: number,
): Product[] {
  const unique: Product[] = [];
  const seen = new Set<string>();
  for (const product of products) {
    if (!isUsableCard(product)) continue;
    if (excluded.has(product.slug) || seen.has(product.slug)) continue;
    seen.add(product.slug);
    unique.push(product);
    if (unique.length >= limit) break;
  }
  return unique;
}

async function loadCatalogFallback(limit: number): Promise<Product[]> {
  try {
    const response = await getProducts({
      limit,
      expand: ["seller"],
      sort: "popular",
    });
    return response.data ?? [];
  } catch {
    return [];
  }
}

export function CartRecommendations({
  basePath,
  cartSlugs,
  showFreeShipping = false,
}: {
  basePath: string;
  cartSlugs: string[];
  showFreeShipping?: boolean;
}) {
  const t = useTranslations("cart");
  const tp = useTranslations("products");
  const [related, setRelated] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const cartKey = useMemo(
    () => cartSlugs.slice().sort().join("|"),
    [cartSlugs],
  );

  useEffect(() => {
    let cancelled = false;
    const cartItems = cartKey.split("|").filter(Boolean);

    void (async () => {
      setLoading(true);
      try {
        const cartProducts = (
          await Promise.all(
            cartItems
              .slice(0, 3)
              .map((slug) => getProduct(slug).catch(() => null)),
          )
        ).filter((product): product is Product => Boolean(product));
        const seedProduct = cartProducts[0] ?? null;

        const [similarLists, shopProducts, trending, arrivals, catalog] =
          await Promise.all([
            Promise.all(
              cartProducts.map((product) =>
                getSimilarProducts(product.id, undefined, SECTION_LIMIT).catch(
                  () => [] as Product[],
                ),
              ),
            ),
            seedProduct
              ? getMoreFromShopProducts(
                  seedProduct.id,
                  undefined,
                  SECTION_LIMIT,
                ).catch(() => [] as Product[])
              : Promise.resolve([] as Product[]),
            getTrendingProducts(undefined, SECTION_LIMIT * 2).catch(
              () => [] as Product[],
            ),
            getNewArrivalProducts(undefined, SECTION_LIMIT * 2).catch(
              () => [] as Product[],
            ),
            loadCatalogFallback(SECTION_LIMIT * 3),
          ]);

        if (cancelled) return;

        const excluded = new Set(cartItems);
        const similarPool = similarLists.flat();
        const relatedProducts = takeUnique(
          [...similarPool, ...shopProducts, ...trending, ...catalog],
          excluded,
          SECTION_LIMIT,
        );

        const relatedSlugs = new Set(
          relatedProducts.map((product) => product.slug),
        );
        const recommendedExcluded = new Set([...excluded, ...relatedSlugs]);
        const recommendedProducts = takeUnique(
          [...trending, ...arrivals, ...catalog, ...similarPool],
          recommendedExcluded,
          SECTION_LIMIT,
        );

        setRelated(relatedProducts);
        setRecommended(recommendedProducts);
      } catch {
        if (!cancelled) {
          setRelated([]);
          setRecommended([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cartKey]);

  if (loading) {
    return (
      <div className="mt-16 space-y-14 border-t border-marketplace-border pt-14">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-marketplace-muted/50" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-square rounded-md bg-marketplace-muted/40" />
                <div className="h-4 w-3/4 rounded bg-marketplace-muted/40" />
                <div className="h-4 w-1/3 rounded bg-marketplace-muted/30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!related.length && !recommended.length) return null;

  return (
    <div className="mt-16 space-y-14 border-t border-marketplace-border pt-14">
      {related.length > 0 ? (
        <RecommendationSection
          title={t("relatedItemsTitle")}
          products={related}
          basePath={basePath}
          addLabel={t("addToCartPlus")}
          pendingLabel={tp("adding")}
          viewLabel={t("viewItem")}
          freeShippingLabel={showFreeShipping ? t("freeShippingBadge") : null}
        />
      ) : null}
      {recommended.length > 0 ? (
        <RecommendationSection
          title={t("recommendedForYouTitle")}
          products={recommended}
          basePath={basePath}
          addLabel={t("addToCartPlus")}
          pendingLabel={tp("adding")}
          viewLabel={t("viewItem")}
          freeShippingLabel={showFreeShipping ? t("freeShippingBadge") : null}
        />
      ) : null}
    </div>
  );
}

function RecommendationSection({
  title,
  products,
  basePath,
  addLabel,
  pendingLabel,
  viewLabel,
  freeShippingLabel,
}: {
  title: string;
  products: Product[];
  basePath: string;
  addLabel: string;
  pendingLabel: string;
  viewLabel: string;
  freeShippingLabel: string | null;
}) {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-marketplace-foreground">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((product) => {
          const seller =
            product.seller_name?.trim() || product.seller?.name?.trim() || null;
          return (
            <article key={product.id} className="min-w-0">
              <Link
                href={`${basePath}/products/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-marketplace-surface-warm">
                  <ProductImage
                    src={product.thumbnail_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 45vw, 220px"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-marketplace-foreground group-hover:underline">
                  {product.name}
                </h3>
              </Link>
              {seller ? (
                <p className="mt-0.5 truncate text-xs text-marketplace-muted-foreground">
                  {seller}
                </p>
              ) : null}
              {product.price?.display_amount ? (
                <p className="mt-1 text-sm font-medium tabular-nums text-marketplace-foreground">
                  {product.price.display_amount}
                </p>
              ) : null}
              {freeShippingLabel ? (
                <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                  {freeShippingLabel}
                </p>
              ) : null}
              {product.purchasable && product.default_variant_id ? (
                <FeaturedCollectionQuickAdd
                  variantId={product.default_variant_id}
                  buttonLabel={addLabel}
                  pendingLabel={pendingLabel}
                  className="mt-2 h-9 w-full rounded-full border border-marketplace-foreground bg-transparent text-sm font-medium text-marketplace-foreground hover:bg-marketplace-surface-warm"
                />
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-2 h-9 w-full rounded-full border-marketplace-foreground"
                >
                  <Link href={`${basePath}/products/${product.slug}`}>
                    <Plus aria-hidden="true" className="size-3.5" />
                    {viewLabel}
                  </Link>
                </Button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
