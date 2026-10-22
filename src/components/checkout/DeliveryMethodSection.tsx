"use client";

import type { Cart, Fulfillment } from "@spree/sdk";
import { PackageCheck, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DeliveryMethodSectionProps {
  fulfillments: Fulfillment[];
  items: NonNullable<Cart["items"]>;
  onDeliveryRateSelect: (
    fulfillmentId: string,
    rateId: string,
  ) => Promise<void>;
  processing: boolean;
  errors?: string[];
}

export function DeliveryMethodSection({
  fulfillments,
  items,
  onDeliveryRateSelect,
  processing,
  errors,
}: DeliveryMethodSectionProps) {
  const tRoot = useTranslations();
  const t = useTranslations("checkout");

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        {t("shippingMethod")}
      </h2>

      {errors && errors.length > 0 && (
        <div className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 mb-3">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-700">
              {error}
            </p>
          ))}
        </div>
      )}

      {fulfillments.length === 0 ? (
        <div className="rounded-sm bg-gray-100 px-4 py-3.5 text-sm text-gray-500">
          {t("enterShippingAddressForMethods")}
        </div>
      ) : (
        <div className="space-y-4">
          {fulfillments.map((fulfillment, index) => {
            const selectedRate = fulfillment.delivery_rates.find(
              (r) => r.selected,
            );
            const fulfillmentItems = fulfillment.items
              .map(({ item_id }) => items.find((item) => item.id === item_id))
              .filter((item) => item !== undefined);
            const sellerNames = [
              ...new Set(
                fulfillmentItems
                  .map((item) => item.seller_name)
                  .filter((name): name is string => Boolean(name)),
              ),
            ];
            return (
              <section
                key={fulfillment.id}
                className="overflow-hidden rounded-md border border-gray-200 bg-white"
              >
                <div className="flex items-start gap-3 bg-gray-50 px-4 py-3.5">
                  <PackageCheck
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    {sellerNames.length > 0 && (
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        <Store
                          className="h-3.5 w-3.5 flex-shrink-0 text-gray-500"
                          aria-hidden="true"
                        />
                        <span className="text-gray-500">{tRoot("soldBy")}</span>
                        <span className="truncate">
                          {sellerNames.join(", ")}
                        </span>
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-600">
                      {t("shipmentOf", {
                        current: index + 1,
                        total: fulfillments.length,
                      })}
                      {fulfillment.stock_location?.name && (
                        <span>
                          {" "}
                          ·{" "}
                          {t("shipsFrom", {
                            location: fulfillment.stock_location.name,
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <RadioGroup
                  value={selectedRate?.id ?? ""}
                  onValueChange={(rateId) =>
                    onDeliveryRateSelect(fulfillment.id, rateId)
                  }
                  disabled={processing}
                  className="gap-0"
                >
                  {fulfillment.delivery_rates.map((rate) => (
                    <label
                      key={rate.id}
                      className={`flex items-center justify-between border-t border-gray-100 px-4 py-3.5 cursor-pointer transition-colors ${
                        rate.selected
                          ? "bg-blue-50"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={rate.id} />
                        <span className="text-sm font-medium text-gray-900">
                          {rate.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {rate.display_cost}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
