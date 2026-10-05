"use client";

import type { Product } from "@spree/sdk";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FeaturedCollectionQuickAdd } from "@/components/products/FeaturedCollectionQuickAdd";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import {
  getNewArrivalProducts,
  getTrendingProducts,
} from "@/lib/data/recommendations";

const ADD_ON_PRICE_CAP = 30;

function productAmount(product: Product): number | null {
  const raw = product.price?.amount;
  if (raw == null || raw === "") return null;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

function discountPercent(product: Product): number | null {
  const amount = productAmount(product);
  const compareRaw =
    product.price?.compare_at_amount ?? product.original_price?.amount;
  if (amount == null || compareRaw == null || compareRaw === "") return null;
  const compare = Number.parseFloat(compareRaw);
  if (!Number.isFinite(compare) || compare <= amount) return null;
  return Math.round(((compare - amount) / compare) * 100);
}

function isUsableAddOn(product: Product, inCart: Set<string>): boolean {
  const hasPrice = Boolean(
    product.price?.display_amount ||
      (product.price?.amount != null && product.price.amount !== ""),
  );
  return Boolean(
    product.slug &&
      product.name &&
      hasPrice &&
      product.default_variant_id &&
      !inCart.has(product.slug),
  );
}

export function CartAddOns({
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
  const [products, setProducts] = useState<Product[]>([]);
  const cartKey = [...new Set(cartSlugs)].join("|");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([getTrendingProducts(), getNewArrivalProducts()])
      .then(([trending, arrivals]) => {
        if (cancelled) return;
        const inCart = new Set(cartKey.split("|").filter(Boolean));
        const seen = new Set<string>();
        const pool = [...trending, ...arrivals].filter((product) => {
          if (!isUsableAddOn(product, inCart) || seen.has(product.slug)) {
            return false;
          }
          seen.add(product.slug);
          return true;
        });
        const underCap = pool.filter((product) => {
          const amount = productAmount(product);
          return amount != null && amount > 0 && amount < ADD_ON_PRICE_CAP;
        });
        setProducts((underCap.length >= 2 ? underCap : pool).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [cartKey]);

  if (!products.length) return null;

  return (
    <section className="mt-12 border-t border-marketplace-border pt-10">
      <h2 className="mb-5 text-lg font-bold tracking-tight text-marketplace-foreground">
        {showFreeShipping
          ? t("cartAddOnsTitleWithShipping")
          : t("cartAddOnsTitle")}
      </h2>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
        {products.map((product) => {
          const percentOff = discountPercent(product);
          return (
            <article key={product.id} className="min-w-0">
              <Link
                href={`${basePath}/products/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-marketplace-surface">
                  <ProductImage
                    src={product.thumbnail_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 45vw, 220px"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm leading-5 text-marketplace-foreground group-hover:underline">
                  {product.name}
                </h3>
              </Link>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                {product.price?.display_amount ? (
                  <p className="text-sm font-medium tabular-nums text-marketplace-foreground">
                    {product.price.display_amount}
                  </p>
                ) : null}
                {percentOff != null &&
                product.price?.display_compare_at_amount ? (
                  <>
                    <p className="text-xs text-marketplace-muted-foreground line-through">
                      {product.price.display_compare_at_amount}
                    </p>
                    <p className="text-xs font-medium text-marketplace-sale">
                      {t("percentOff", { percent: percentOff })}
                    </p>
                  </>
                ) : null}
              </div>
              {showFreeShipping ? (
                <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                  {t("freeShippingBadge")}
                </p>
              ) : null}
              {product.purchasable && product.default_variant_id ? (
                <FeaturedCollectionQuickAdd
                  variantId={product.default_variant_id}
                  buttonLabel={t("addToCartPlus")}
                  pendingLabel={tp("adding")}
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
                    {t("viewItem")}
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
