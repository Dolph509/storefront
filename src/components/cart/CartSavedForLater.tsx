"use client";

import type { WishlistItem } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { listFavorites, removeFavorite } from "@/lib/data/favorites";

export function CartSavedForLater({
  basePath,
  refreshKey = 0,
}: {
  basePath: string;
  refreshKey?: number;
}) {
  const t = useTranslations("cart");
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const result = await listFavorites();
      if (result.success) {
        setItems(result.data.filter((item) => item.product || item.variant));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (!isAuthenticated || (!loading && items.length === 0)) return null;

  const handleMoveToCart = async (item: WishlistItem) => {
    if (!item.variant_id || busyId) return;
    setBusyId(item.id);
    try {
      const result = await addItem(item.variant_id, item.quantity || 1);
      if (!result.success) {
        toast.error(result.error || t("moveToCartFailed"));
        return;
      }
      await removeFavorite({
        productId: item.product_id,
        variantId: item.variant_id,
      });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success(t("movedToCart"));
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item: WishlistItem) => {
    if (busyId) return;
    setBusyId(item.id);
    try {
      const result = await removeFavorite({
        productId: item.product_id,
        variantId: item.variant_id,
      });
      if (!result.success) {
        toast.error(result.error || t("removeSavedFailed"));
        return;
      }
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mt-16 border-t border-marketplace-border pt-14">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-marketplace-foreground">
        {loading
          ? t("savedForLaterTitle", { count: items.length || 0 })
          : t("savedForLaterTitle", { count: items.length })}
      </h2>

      {loading && items.length === 0 ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map((index) => (
            <div key={index} className="flex gap-5">
              <div className="size-28 rounded-md bg-marketplace-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-marketplace-muted" />
                <div className="h-3 w-1/3 rounded bg-marketplace-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-marketplace-border">
          {items.map((item) => {
            const product = item.product;
            const variant = item.variant;
            const name =
              product?.name || variant?.options_text || t("savedItem");
            const slug = product?.slug;
            const image =
              variant?.thumbnail_url || product?.thumbnail_url || null;
            const price =
              variant?.price?.display_amount ||
              product?.price?.display_amount ||
              null;
            const seller =
              product?.seller_name?.trim() ||
              product?.seller?.name?.trim() ||
              null;
            const sellerSlug =
              product?.seller_slug?.trim() ||
              product?.seller?.slug?.trim() ||
              null;
            const busy = busyId === item.id;

            return (
              <li key={item.id} className="flex gap-4 py-6 sm:gap-5">
                {slug ? (
                  <Link
                    href={`${basePath}/products/${slug}`}
                    className="relative size-28 shrink-0 overflow-hidden rounded-md bg-marketplace-surface-warm sm:size-32"
                  >
                    <ProductImage
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </Link>
                ) : (
                  <div className="relative size-28 shrink-0 overflow-hidden rounded-md bg-marketplace-surface-warm sm:size-32">
                    <ProductImage
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 max-w-xl">
                      {slug ? (
                        <Link
                          href={`${basePath}/products/${slug}`}
                          className="text-[15px] leading-snug text-marketplace-foreground hover:underline"
                        >
                          {name}
                        </Link>
                      ) : (
                        <p className="text-[15px] leading-snug text-marketplace-foreground">
                          {name}
                        </p>
                      )}
                      {seller ? (
                        <p className="mt-1 text-sm text-marketplace-muted-foreground">
                          {t("savedFromSeller")}{" "}
                          {sellerSlug ? (
                            <Link
                              href={`${basePath}/sellers/${sellerSlug}`}
                              className="text-marketplace-foreground hover:underline"
                            >
                              {seller}
                            </Link>
                          ) : (
                            <span className="text-marketplace-foreground">
                              {seller}
                            </span>
                          )}
                        </p>
                      ) : null}
                    </div>
                    {price ? (
                      <p className="shrink-0 text-[15px] font-medium tabular-nums text-marketplace-foreground">
                        {price}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-full border-marketplace-foreground px-4"
                      disabled={busy || !item.variant_id}
                      onClick={() => handleMoveToCart(item)}
                    >
                      {t("moveToCart")}
                    </Button>
                    {slug ? (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-9 rounded-full border-marketplace-border px-4"
                      >
                        <Link href={`${basePath}/account/favorites`}>
                          {t("keepInFavorites")}
                        </Link>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-full border-marketplace-border px-4"
                      disabled={busy}
                      onClick={() => handleRemove(item)}
                    >
                      {t("removeSaved")}
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-full border-marketplace-foreground px-8 sm:w-auto"
        >
          <Link href={`${basePath}/account/favorites`}>
            {t("viewFavorites")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
