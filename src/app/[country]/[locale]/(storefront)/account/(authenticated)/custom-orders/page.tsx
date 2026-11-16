import {
  ArrowUpRight,
  CalendarDays,
  MessageCircle,
  PackageCheck,
} from "lucide-react";
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
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  });

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
                className="group flex flex-col gap-4 px-4 py-5 transition-colors hover:bg-marketplace-surface-warm/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-marketplace-brand sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-marketplace-surface-warm text-marketplace-brand">
                    <PackageCheck aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-marketplace-foreground">
                      {request.source_product_name || t("requestFallback")}
                    </p>
                    <p className="mt-1 text-sm text-marketplace-muted-foreground">
                      {request.seller_name}
                    </p>
                    <p className="mt-2 line-clamp-1 text-sm text-marketplace-muted-foreground">
                      {request.description}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(request.status)}`}
                    >
                      {t(`status_${request.status}`)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-marketplace-muted-foreground">
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      {dateFormatter.format(new Date(request.created_at))}
                    </span>
                    {request.message_thread_id ? (
                      <span className="inline-flex items-center gap-1 text-xs text-marketplace-muted-foreground">
                        <MessageCircle
                          aria-hidden="true"
                          className="size-3.5"
                        />
                        {t("openConversation")}
                      </span>
                    ) : null}
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-marketplace-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function statusClasses(status: string) {
  switch (status) {
    case "quoted":
      return "bg-amber-100 text-amber-900";
    case "purchased":
      return "bg-emerald-100 text-emerald-900";
    case "cancelled":
      return "bg-marketplace-surface-warm text-marketplace-muted-foreground";
    default:
      return "bg-sky-100 text-sky-900";
  }
}
