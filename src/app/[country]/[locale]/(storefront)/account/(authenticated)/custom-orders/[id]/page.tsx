import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CancelCustomOrderButton } from "@/components/account/CancelCustomOrderButton";
import { Button } from "@/components/ui/button";
import { getCustomOrderRequest } from "@/lib/data/custom-orders";

export default async function CustomOrderPage({
  params,
}: {
  params: Promise<{ country: string; locale: string; id: string }>;
}) {
  const { country, locale, id } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "customOrders",
  });
  const basePath = `/${country}/${locale}`;
  let request;
  try {
    request = await getCustomOrderRequest(id);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`${basePath}/account/custom-orders`}
          className="text-sm text-gray-600 hover:underline"
        >
          {t("backToOrders")}
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("detailTitle")}
          </h1>
          <span className="text-sm font-medium text-gray-600">
            {t(`status_${request.status}`)}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {t(`statusHelp_${request.status}`)}
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <p className="text-sm text-gray-500">{t("sellerLabel")}</p>
          <p className="font-medium">{request.seller_name}</p>
        </div>
        {request.source_product_name ? (
          <div>
            <p className="text-sm text-gray-500">{t("sourceProductLabel")}</p>
            <p>{request.source_product_name}</p>
          </div>
        ) : null}
        <div>
          <p className="text-sm text-gray-500">{t("requestLabel")}</p>
          <p className="whitespace-pre-wrap">{request.description}</p>
        </div>
        {request.seller_note ? (
          <div>
            <p className="text-sm text-gray-500">{t("sellerNoteLabel")}</p>
            <p className="whitespace-pre-wrap">{request.seller_note}</p>
          </div>
        ) : null}
        {request.attachments.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">{t("attachmentsLabel")}</p>
            <ul className="flex flex-wrap gap-3">
              {request.attachments.map((attachment) => (
                <li key={attachment.id}>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline"
                  >
                    {attachment.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-3">
        {request.message_thread_id ? (
          <Button asChild variant="outline">
            <Link
              href={`${basePath}/account/messages/${request.message_thread_id}`}
            >
              {t("openConversation")}
            </Link>
          </Button>
        ) : null}
        {request.status === "quoted" && request.product_id ? (
          <Button asChild>
            <Link href={`${basePath}/products/private/${request.product_id}`}>
              {t("viewListing")}
            </Link>
          </Button>
        ) : null}
        {request.status === "purchased" && request.resulting_order_id ? (
          <Button asChild>
            <Link
              href={`${basePath}/account/orders/${request.resulting_order_id}`}
            >
              {t("viewOrder")}
            </Link>
          </Button>
        ) : null}
        {request.status === "open" || request.status === "quoted" ? (
          <CancelCustomOrderButton id={request.id} />
        ) : null}
      </div>
    </div>
  );
}
