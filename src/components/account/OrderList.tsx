import type { Order } from "@spree/sdk";
import { ArrowUpRight, Package } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import {
  formatDate,
  getFulfillmentStatusColor,
  getPaymentStatusColor,
} from "@/lib/utils/format";
import {
  groupOrdersForHistory,
  sumOrderGroupDisplayTotal,
} from "@/lib/utils/group-orders-for-history";

function getStatusLabel(
  status: string | null,
  t: (key: string, values?: Record<string, string>) => string,
): string {
  if (!status) return t("notAvailable");
  const key = status.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  const humanized = status.replace(/_/g, " ");
  try {
    const label = t(key, { default: humanized });
    if (!label || label === key || label.endsWith(`.${key}`)) return humanized;
    return label;
  } catch {
    return humanized;
  }
}

interface OrderListProps {
  orders: Order[];
  basePath: string;
  locale: string;
}

export async function OrderList({ orders, basePath, locale }: OrderListProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "orders",
  });
  const buckets = groupOrdersForHistory(orders);

  return (
    <div className="flex flex-col gap-4">
      {buckets.map((bucket) => {
        const isGroup = bucket.orders.length > 1 || Boolean(bucket.groupNumber);
        const firstOrder = bucket.orders[0];
        const heading = isGroup
          ? bucket.groupNumber
            ? t("groupHeading", { number: bucket.groupNumber })
            : t("groupHeadingFallback")
          : t("orderHeading", { number: firstOrder.number });
        const detailsHref = `${basePath}/account/orders/${firstOrder.id}`;

        return (
          <article
            key={bucket.key}
            className="overflow-hidden rounded-lg border border-marketplace-border-subtle bg-marketplace-surface"
            data-theme-order-list-group
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-marketplace-border-subtle bg-marketplace-surface-subtle px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-sm font-semibold text-marketplace-foreground">
                  {heading}
                </h2>
                <p className="mt-1 text-xs text-marketplace-muted-foreground">
                  {t("placedOn", {
                    date: formatDate(bucket.placedAt, "-", locale),
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {isGroup ? (
                  <p className="text-sm font-medium text-marketplace-foreground">
                    {t("groupTotal", {
                      total: sumOrderGroupDisplayTotal(bucket.orders) ?? "-",
                    })}
                  </p>
                ) : null}
                <Link
                  href={detailsHref}
                  className="hidden items-center gap-1 text-xs font-semibold text-marketplace-brand hover:underline sm:inline-flex"
                >
                  {t("view")}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </header>

            <ul className="divide-y divide-marketplace-border-subtle">
              {bucket.orders.map((order) => {
                const href = `${basePath}/account/orders/${order.id}`;
                const firstItem = order.items?.[0];
                const additionalItems = Math.max(
                  (order.items?.length ?? 0) - 1,
                  0,
                );

                return (
                  <li key={order.id} className="px-4 py-4 sm:px-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-md bg-marketplace-surface-warm">
                          {firstItem?.thumbnail_url ? (
                            <ProductImage
                              src={firstItem.thumbnail_url}
                              alt={firstItem.name}
                              fill
                              sizes="72px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center text-marketplace-muted-foreground">
                              <Package className="size-5" aria-hidden="true" />
                            </span>
                          )}
                          {additionalItems > 0 ? (
                            <span className="absolute bottom-1 right-1 rounded-sm bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              +{additionalItems}
                            </span>
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          {order.seller_name ? (
                            <p className="mb-1 text-xs font-medium text-marketplace-muted-foreground">
                              {order.seller_slug ? (
                                <Link
                                  href={`${basePath}/sellers/${order.seller_slug}`}
                                  className="hover:underline"
                                >
                                  {order.seller_name}
                                </Link>
                              ) : (
                                order.seller_name
                              )}
                            </p>
                          ) : null}
                          <p className="text-sm font-semibold text-marketplace-foreground">
                            <Link href={href} className="hover:underline">
                              #{order.number}
                            </Link>
                            <span className="mx-2 text-marketplace-border">
                              ·
                            </span>
                            <span className="text-xs font-normal text-marketplace-muted-foreground">
                              {t("itemCount", {
                                count: order.total_quantity ?? 0,
                              })}
                            </span>
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${getPaymentStatusColor(order.payment_status)}`}
                            >
                              {getStatusLabel(order.payment_status ?? null, t)}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${getFulfillmentStatusColor(order.fulfillment_status)}`}
                            >
                              {getStatusLabel(order.fulfillment_status, t)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-marketplace-border-subtle pt-3 sm:ml-auto sm:border-0 sm:pt-0">
                        <span className="text-base font-semibold tabular-nums text-marketplace-foreground">
                          {order.display_total}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="sm:hidden"
                        >
                          <Link href={href}>{t("view")}</Link>
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
