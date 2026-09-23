"use client";

import type { LineItem } from "@spree/sdk";
import { Trash } from "lucide-react";
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
  const groups = groupLineItemsBySeller(items, t("marketplaceSeller"));

  return (
    <div className={compact ? "divide-y divide-gray-200" : "space-y-6"}>
      {groups.map((group) => (
        <section
          key={group.key}
          className={
            compact
              ? ""
              : "rounded-xl border border-marketplace-border-subtle bg-white shadow-[0_4px_18px_rgb(59_23_50/6%)]"
          }
        >
          <header
            className={
              compact
                ? "px-4 pt-4 pb-1"
                : "flex items-center justify-between gap-3 border-b border-marketplace-border-subtle px-6 py-3"
            }
          >
            <h2 className="font-display text-lg font-semibold text-marketplace-foreground">
              {group.sellerSlug ? (
                <Link
                  href={`${basePath}/sellers/${group.sellerSlug}`}
                  className="hover:text-primary hover:underline"
                  onClick={onClose}
                >
                  {group.sellerName}
                </Link>
              ) : (
                group.sellerName
              )}
            </h2>
            <p className="text-xs text-gray-500">
              {t("sellerItemCount", { count: group.items.length })}
            </p>
          </header>

          <ul
            className={
              compact ? "divide-y divide-gray-100" : "divide-y divide-gray-100"
            }
          >
            {group.items.map((item) => (
              <li key={item.id} className={compact ? "p-4" : "p-5 sm:p-6"}>
                <div className="flex gap-4">
                  <Link
                    href={`${basePath}/products/${item.slug}`}
                    className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:size-36"
                    onClick={onClose}
                  >
                    <ProductImage
                      src={item.thumbnail_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`${basePath}/products/${item.slug}`}
                        className="font-display text-xl font-semibold text-marketplace-foreground hover:text-marketplace-brand line-clamp-2"
                        onClick={onClose}
                      >
                        {item.name}
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon-xs"
                        onClick={() => onRemove(item)}
                        disabled={updating}
                        aria-label={t("removeItemLabel", { name: item.name })}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>

                    {item.options_text ? (
                      <p className="mt-1 text-sm text-gray-500">
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
                      <div className="mt-3 flex flex-wrap gap-3">
                        <Link
                          href={`${basePath}/products/${item.slug}`}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          {t("reconfigure")}
                        </Link>
                        <p className="text-xs text-gray-500 w-full">
                          {t("reconfigureHelp")}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between">
                      <QuantityPickerField
                        quantity={item.quantity}
                        onQuantityChange={(quantity) =>
                          onUpdateQuantity(item.id, quantity)
                        }
                        disabled={updating}
                      />
                      <div className="text-sm font-medium">
                        {item.compare_at_amount &&
                        item.price != null &&
                        parseFloat(item.compare_at_amount) >
                          parseFloat(item.price) ? (
                          <>
                            <span className="text-gray-400 line-through mr-2">
                              {item.display_compare_at_amount}
                            </span>
                            <span className="text-red-600">
                              {item.display_price}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-900">
                            {item.display_price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
