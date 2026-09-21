import type { BuyerOffer } from "@spree/sdk";
import { Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MessageSellerButton } from "@/components/account/MessageSellerButton";

interface OffersListProps {
  offers: BuyerOffer[];
  basePath: string;
  locale: string;
}

function formatMoney(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export async function OffersList({
  offers,
  basePath,
  locale,
}: OffersListProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "offers",
  });

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t("emptyTitle")}
        </h3>
        <p className="text-gray-500">{t("emptyDescription")}</p>
      </div>
    );
  }

  return (
    <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
      {offers.map((offer) => (
        <li
          key={offer.id}
          className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {t(`status_${offer.status}`, { defaultValue: offer.status })}
            </p>
            <p className="text-sm text-gray-600">
              {t("offerAmount")}:{" "}
              {formatMoney(offer.offer_amount, offer.currency, locale)}
            </p>
            <p className="text-sm text-gray-500">
              {t("listAmount")}:{" "}
              {formatMoney(offer.list_amount, offer.currency, locale)}
            </p>
          </div>
          <MessageSellerButton offerId={offer.id} basePath={basePath} />
        </li>
      ))}
    </ul>
  );
}
