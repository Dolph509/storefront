import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { AccountReviewsPanel } from "@/components/reviews/AccountReviewsPanel";
import { getOrders } from "@/lib/data/orders";
import {
  getMyProductReviews,
  getReviewablePurchases,
} from "@/lib/data/reviews";
import { lineItemDeliveredAt } from "@/lib/reviews/order-delivered-at";

interface ReviewsPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  await connection();
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "reviews",
  });
  const basePath = `/${country}/${locale}`;

  const [reviewable, myReviewsPage, ordersPage] = await Promise.all([
    getReviewablePurchases(),
    getMyProductReviews({ limit: 50 }),
    getOrders({ limit: 50 }),
  ]);

  const deliveredAtByLineItem: Record<string, string> = {};
  for (const order of ordersPage.data) {
    if (!order.completed_at) continue;
    for (const item of order.items ?? []) {
      const deliveredAt = lineItemDeliveredAt(order, item.id);
      if (deliveredAt) {
        deliveredAtByLineItem[item.id] = deliveredAt;
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t("accountTitle")}
      </h1>
      <AccountReviewsPanel
        reviewablePurchases={reviewable.data}
        myReviews={myReviewsPage.data}
        deliveredAtByLineItem={deliveredAtByLineItem}
        basePath={basePath}
        locale={locale}
      />
    </div>
  );
}
