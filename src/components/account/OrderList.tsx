import type { Order } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
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
        const heading = isGroup
          ? bucket.groupNumber
            ? t("groupHeading", { number: bucket.groupNumber })
            : t("groupHeadingFallback")
          : t("orderHeading", { number: bucket.orders[0].number });

        return (
          <article
            key={bucket.key}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {heading}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {t("placedOn", {
                    date: formatDate(bucket.placedAt, "-", locale),
                  })}
                </p>
              </div>
              {isGroup ? (
                <p className="text-sm font-medium text-gray-900">
                  {t("groupTotal", {
                    total: sumOrderGroupDisplayTotal(bucket.orders) ?? "—",
                  })}
                </p>
              ) : null}
            </header>

            <ul className="divide-y divide-gray-100">
              {bucket.orders.map((order) => (
                <li key={order.id} className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      {order.seller_name ? (
                        <p className="text-sm font-medium text-gray-900">
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
                      <p className="text-sm text-gray-600">
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-auto p-0"
                        >
                          <Link href={`${basePath}/account/orders/${order.id}`}>
                            #{order.number}
                          </Link>
                        </Button>
                        <span className="mx-2 text-gray-300">·</span>
                        <span>
                          {t("itemCount", {
                            count: order.total_quantity ?? 0,
                          })}
                        </span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize ${getPaymentStatusColor(order.payment_status)}`}
                        >
                          {getStatusLabel(order.payment_status ?? null, t)}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize ${getFulfillmentStatusColor(order.fulfillment_status)}`}
                        >
                          {getStatusLabel(order.fulfillment_status ?? null, t)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {order.display_total}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`${basePath}/account/orders/${order.id}`}>
                          {t("view")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
