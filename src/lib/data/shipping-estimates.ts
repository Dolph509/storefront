"use server";

import type { DeliveryDestination } from "@/lib/delivery-destination";
import { getClient, getLocaleOptions } from "@/lib/spree";
import { getCustomer } from "./customer";
import { actionResult } from "./utils";

/**
 * Default ship-to from the signed-in buyer's address book (for PDP quotes).
 */
export async function getCustomerShippingDestination(): Promise<DeliveryDestination | null> {
  const customer = await getCustomer();
  const address =
    customer?.default_shipping_address ||
    customer?.addresses?.find((entry) => entry.is_default_shipping) ||
    customer?.addresses?.[0];
  if (!address?.country_code) return null;

  return {
    countryCode: address.country_code.toLowerCase(),
    postalCode: (address.postal_code || "").trim(),
    stateCode: address.state_code?.toUpperCase() || undefined,
    city: address.city?.trim() || undefined,
    manual: false,
  };
}

export async function estimateProductShipping(input: {
  productId: string;
  countryCode: string;
  postalCode?: string;
  stateCode?: string;
  variantId?: string | null;
  quantity?: number;
}) {
  return actionResult(async () => {
    const options = await getLocaleOptions();
    const response = await getClient().products.shippingEstimates.create(
      input.productId,
      {
        country_code: input.countryCode.toUpperCase(),
        postal_code: input.postalCode?.trim() || undefined,
        state_code: input.stateCode?.toUpperCase() || undefined,
        variant_id: input.variantId || undefined,
        quantity: input.quantity,
      },
      options,
    );
    return { estimate: response.shipping_estimate };
  }, "Failed to estimate shipping");
}
