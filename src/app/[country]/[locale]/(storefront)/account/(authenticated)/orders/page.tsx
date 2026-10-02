import Link from "next/link";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { AccountEmptyState } from "@/components/account/AccountEmptyState";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { OrderList } from "@/components/account/OrderList";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/lib/data/orders";

interface OrdersPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  await connection();
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "orders",
  });
  const basePath = `/${country}/${locale}`;

  const response = await getOrders({ limit: 50 });
  const orders = response.data.filter((order) => order.completed_at !== null);

  return (
    <div>
      <AccountPageHeader title={t("orderHistory")} />

      {orders.length === 0 ? (
        <AccountEmptyState
          illustration="order-history-empty"
          title={t("noOrders")}
          description={t("noOrdersDescription")}
          action={
            <Button asChild>
              <Link href={`${basePath}/products`}>{t("startShopping")}</Link>
            </Button>
          }
        />
      ) : (
        <OrderList orders={orders} basePath={basePath} locale={locale} />
      )}
    </div>
  );
}
