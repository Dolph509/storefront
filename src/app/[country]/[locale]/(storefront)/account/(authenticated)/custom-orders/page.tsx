import Link from "next/link";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { AccountEmptyState } from "@/components/account/AccountEmptyState";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
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
      <AccountPageHeader title={t("accountTitle")} />
      {requests.length === 0 ? (
        <AccountEmptyState
          illustration="no-custom-orders"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <ul className="divide-y divide-marketplace-border-subtle overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                href={`${basePath}/account/custom-orders/${request.id}`}
                className="flex flex-col gap-2 px-6 py-4 hover:bg-marketplace-muted/40"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-marketplace-foreground">
                    {request.source_product_name ||
                      request.seller_name ||
                      t("requestFallback")}
                  </p>
                  <span className="text-sm font-medium text-marketplace-muted-foreground">
                    {t(`status_${request.status}`)}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-marketplace-muted-foreground">
                  {request.description}
                </p>
                <p className="text-xs text-marketplace-muted-foreground">
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
