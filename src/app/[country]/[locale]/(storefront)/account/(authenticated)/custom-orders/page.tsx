import Link from "next/link";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
import { getCustomOrderRequests } from "@/lib/data/custom-orders";

export default async function CustomOrdersPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  await connection();
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "customOrders",
  });
  const requests = (await getCustomOrderRequests()).data;
  const basePath = `/${country}/${locale}`;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("accountTitle")}</h1>
      {requests.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <EmptyStateIllustration
            name="no-custom-orders"
            className="mx-auto mb-4 text-gray-600"
          />
          <h2 className="font-medium text-gray-900">{t("emptyTitle")}</h2>
          <p className="mt-2 text-sm text-gray-500">{t("emptyDescription")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                href={`${basePath}/account/custom-orders/${request.id}`}
                className="flex flex-col gap-2 px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-gray-900">
                    {request.source_product_name ||
                      request.seller_name ||
                      t("requestFallback")}
                  </p>
                  <span className="text-sm font-medium text-gray-600">
                    {t(`status_${request.status}`)}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-gray-600">
                  {request.description}
                </p>
                <p className="text-xs text-gray-500">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(new Date(request.created_at))}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
