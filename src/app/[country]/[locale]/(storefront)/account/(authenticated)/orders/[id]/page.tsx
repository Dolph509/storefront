import Link from "next/link";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { OrderDetail } from "@/components/account/OrderDetail";
import { hasOpenOrderHelpRequest } from "@/lib/data/order-help";
import { listOrderProofs } from "@/lib/data/order-proofs";
import { getOrder } from "@/lib/data/orders";
import {
  getMyProductReviews,
  getReviewablePurchases,
} from "@/lib/data/reviews";
import { buildLineItemReviewStates } from "@/lib/reviews/line-item-review-state";

interface OrderDetailPageProps {
  params: Promise<{
    country: string;
    locale: string;
    id: string;
  }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  await connection();
  const { country, locale, id } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "orders",
  });
  const basePath = `/${country}/${locale}`;
  const order = await getOrder(id);

  if (!order || order.completed_at === null) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          {t("orderNotFound")}
        </h2>
        <p className="text-gray-500 mb-6">{t("orderNotFoundDescription")}</p>
        <Link
          href={`${basePath}/account/orders`}
          className="text-primary hover:text-primary font-medium"
        >
          {t("backToOrders")}
        </Link>
      </div>
    );
  }

  const [helpAlreadyOpen, reviewable, myReviewsPage, proofsPage] =
    await Promise.all([
      hasOpenOrderHelpRequest(order.id),
      getReviewablePurchases(),
      getMyProductReviews({ limit: 100 }),
      listOrderProofs(order.id),
    ]);

  const reviewStateMap = buildLineItemReviewStates(
    order,
    reviewable.data,
    myReviewsPage.data,
  );
  const lineItemReviewStates = Object.fromEntries(reviewStateMap);

  return (
    <OrderDetail
      order={order}
      basePath={basePath}
      locale={locale}
      helpAlreadyOpen={helpAlreadyOpen}
      lineItemReviewStates={lineItemReviewStates}
      proofs={proofsPage.data ?? []}
    />
  );
}
