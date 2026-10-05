"use client";

import type { BuyerOffer, Product } from "@spree/sdk";
import { Bell, ChevronDown, Tag } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProductImage } from "@/components/ui/product-image";
import { getBuyerOffers } from "@/lib/data/offers";
import { getProductsByIds } from "@/lib/data/products";
import { formatDate } from "@/lib/utils/format";

interface BuyerDealsMenuProps {
  basePath: string;
}

function formatMoney(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function BuyerDealsMenu({ basePath }: BuyerDealsMenuProps) {
  const t = useTranslations("offers");
  const accountT = useTranslations("account");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<BuyerOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen || loaded || loading) return;

    setLoading(true);
    try {
      const response = await getBuyerOffers({ limit: 8 });
      const rows = Array.isArray(response?.data) ? response.data : [];
      setOffers(rows);
      try {
        const productRows = await getProductsByIds(
          rows.map((offer) => offer.product_id),
        );
        setProducts(productRows);
      } catch (error) {
        console.error("Failed to load buyer deal products", error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to load buyer deals", error);
      setOffers([]);
      setProducts([]);
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  }

  const productsById = new Map(
    products.map((product) => [product.id, product]),
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-header-hover-trigger="true"
          aria-label={t("deals")}
          className="relative flex h-10 items-center gap-0.5 rounded-full px-1 text-marketplace-foreground transition-[background-color,color] duration-200 ease-out hover:bg-marketplace-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand motion-reduce:transition-none"
        >
          <span className="flex size-8 items-center justify-center">
            <Bell className="size-[1.35rem]" strokeWidth={1.9} />
          </span>
          <ChevronDown className="size-3" aria-hidden="true" />
          <span aria-hidden="true" className="marketplace-header-hover-label">
            {t("deals")}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(20rem,calc(100vw-1rem))] overflow-hidden p-0"
      >
        <header className="flex items-center justify-between gap-3 border-b border-marketplace-border-subtle bg-marketplace-surface-subtle px-4 py-3">
          <h2 className="text-sm font-semibold text-marketplace-foreground">
            {t("deals")}
          </h2>
          <Link
            href={`${basePath}/account/offers`}
            className="text-xs font-medium text-marketplace-brand hover:underline"
          >
            {t("viewAllDeals")}
          </Link>
        </header>

        <div className="max-h-[min(65vh,28rem)] overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="space-y-3 p-4" role="status" aria-live="polite">
              <span className="sr-only">{accountT("loading")}</span>
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-20 animate-pulse rounded-sm bg-marketplace-surface-warm"
                />
              ))}
            </div>
          ) : offers.length ? (
            <ul className="divide-y divide-marketplace-border-subtle">
              {offers.map((offer) => {
                const product = productsById.get(offer.product_id);
                const sellerName =
                  product?.seller_name || product?.seller?.name;
                const status = t(`status_${offer.status}`, {
                  defaultValue: offer.status,
                });
                const summary =
                  offer.status === "awaiting_buyer" && sellerName
                    ? t("sellerCounterOffer", { seller: sellerName })
                    : status;

                return (
                  <li key={offer.id}>
                    <Link
                      href={`${basePath}/account/offers`}
                      className="flex gap-3 px-3 py-3 transition-colors hover:bg-marketplace-surface-warm focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-marketplace-brand"
                    >
                      <span className="relative mt-0.5 size-[4.5rem] shrink-0 overflow-hidden rounded-sm bg-marketplace-surface-subtle">
                        <ProductImage
                          src={product?.thumbnail_url}
                          alt={product?.name ?? ""}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs text-marketplace-muted-foreground">
                          {summary}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-sm font-medium leading-5 text-marketplace-foreground">
                          {product?.name || status}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-marketplace-success">
                          <Tag className="size-3.5" aria-hidden="true" />
                          {formatMoney(
                            offer.offer_amount,
                            offer.currency,
                            locale,
                          )}
                          <span className="font-normal text-marketplace-muted-foreground">
                            {t("offerAmount")}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-marketplace-muted-foreground">
                          {formatDate(offer.updated_at, "-", locale)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center">
              <Tag
                className="mx-auto mb-2 size-5 text-marketplace-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-marketplace-foreground">
                {t("emptyTitle")}
              </p>
              <p className="mt-1 text-xs leading-5 text-marketplace-muted-foreground">
                {t("emptyDescription")}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
