"use client";

import type { LineItem } from "@spree/sdk";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { QuantityPickerField } from "@/components/cart/QuantityPickerField";
import { PersonalizationSnapshot } from "@/components/products/PersonalizationSnapshot";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { groupLineItemsBySeller } from "@/lib/utils/group-line-items-by-seller";

interface CartLineItemsProps {
  items: LineItem[];
  basePath: string;
  updating?: boolean;
  compact?: boolean;
  onClose?: () => void;
  onRemove: (item: LineItem) => void | Promise<void>;
  onUpdateQuantity: (itemId: string, quantity: number) => void | Promise<void>;
}

function sellerLogoUrl(item: LineItem): string | null {
  const seller = item.seller;
  if (!seller) return null;
  return seller.square_logo_url?.trim() || seller.logo_url?.trim() || null;
}

export function CartLineItems({
  items,
  basePath,
  updating = false,
  compact = false,
  onClose,
  onRemove,
  onUpdateQuantity,
}: CartLineItemsProps) {
  const t = useTranslations("cart");
  const th = useTranslations("home");
  const groups = groupLineItemsBySeller(items, t("marketplaceSeller"));

  return (
    <div
      className={
        compact ? "divide-y divide-marketplace-border-subtle" : "space-y-5"
      }
    >
      {groups.length > 1 && !compact ? (
        <p className="text-sm text-marketplace-muted-foreground">
          {t("multiSellerShipNote")}
        </p>
      ) : null}
      {groups.map((group) => {
        const logo = sellerLogoUrl(group.items[0]);
        return (
          <section
            key={group.key}
            data-theme-cart-seller-group
            className={
              compact
                ? ""
                : "overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface"
            }
          >
            <header
              className={
                compact
                  ? "px-4 pt-4 pb-1"
                  : "flex flex-wrap items-center justify-between gap-3 border-b border-marketplace-border-subtle px-4 py-3 sm:px-5"
              }
            >
              <div className="flex min-w-0 items-center gap-3">
                {logo ? (
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-marketplace-muted ring-1 ring-marketplace-border-subtle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} alt="" className="size-full object-cover" />
                  </span>
                ) : null}
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-marketplace-foreground">
                    {group.sellerSlug ? (
                      <Link
                        href={`${basePath}/sellers/${group.sellerSlug}`}
                        className="hover:text-marketplace-brand hover:underline"
                        onClick={onClose}
                      >
                        {group.sellerName}
                      </Link>
                    ) : (
                      group.sellerName
                    )}
                  </h2>
                  <p className="text-xs text-marketplace-muted-foreground">
                    {t("sellerItemCount", { count: group.items.length })}
                  </p>
                </div>
              </div>
              {group.sellerSlug ? (
                <Link
                  href={`${basePath}/sellers/${group.sellerSlug}`}
                  className="shrink-0 text-xs font-semibold text-marketplace-brand hover:underline"
                  onClick={onClose}
                >
                  {th("visitShop")}
                </Link>
              ) : null}
            </header>

            <ul className="divide-y divide-marketplace-border-subtle">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className={compact ? "p-4" : "p-4 sm:p-5"}
                  data-theme-cart-line-item
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <Link
                      href={`${basePath}/products/${item.slug}`}
                      className="relative aspect-square w-full max-w-[5.5rem] shrink-0 overflow-hidden rounded-[var(--marketplace-radius-md)] bg-marketplace-muted sm:size-24"
                      onClick={onClose}
                    >
                      <ProductImage
                        src={item.thumbnail_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`${basePath}/products/${item.slug}`}
                          className="line-clamp-2 text-base font-semibold leading-snug text-marketplace-foreground hover:text-marketplace-brand"
                          onClick={onClose}
                        >
                          {item.name}
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onRemove(item)}
                          disabled={updating}
                          className="shrink-0 text-marketplace-muted-foreground hover:text-marketplace-danger"
                          aria-label={t("removeItemLabel", { name: item.name })}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>

                      {item.options_text ? (
                        <p className="mt-1 text-sm text-marketplace-muted-foreground">
                          {item.options_text}
                        </p>
                      ) : null}

                      <PersonalizationSnapshot
                        snapshot={item.personalization_snapshot}
                        proofRequired={item.proof_required}
                        files={item.personalization_files}
                        compact={compact}
                      />

                      {!compact && item.personalization_snapshot?.length ? (
                        <div className="mt-2">
                          <Link
                            href={`${basePath}/products/${item.slug}`}
                            className="text-sm font-medium text-marketplace-brand hover:underline"
                          >
                            {t("reconfigure")}
                          </Link>
                          <p className="mt-0.5 text-xs text-marketplace-muted-foreground">
                            {t("reconfigureHelp")}
                          </p>
                        </div>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <QuantityPickerField
                          quantity={item.quantity}
                          onQuantityChange={(quantity) =>
                            onUpdateQuantity(item.id, quantity)
                          }
                          disabled={updating}
                        />
                        <div className="text-sm font-semibold tabular-nums text-marketplace-foreground">
                          {item.compare_at_amount &&
                          item.price != null &&
                          parseFloat(item.compare_at_amount) >
                            parseFloat(item.price) ? (
                            <span className="flex flex-wrap items-baseline justify-end gap-x-2">
                              <span className="font-medium text-marketplace-muted-foreground line-through">
                                {item.display_compare_at_amount}
                              </span>
                              <span className="text-marketplace-sale">
                                {item.display_price}
                              </span>
                            </span>
                          ) : (
                            <span>{item.display_price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
