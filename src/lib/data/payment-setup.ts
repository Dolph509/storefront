"use server";

import type { PaymentSetupSession } from "@spree/sdk";
import { getCart } from "@/lib/data/cart";
import { getClient, withAuthRefresh } from "@/lib/spree";
import { actionResult } from "./utils";

function findSetupPaymentMethodId(
  paymentMethods:
    | Array<{ id: string; type?: string; session_required?: boolean }>
    | undefined,
): string | null {
  if (!paymentMethods?.length) return null;
  const stripe = paymentMethods.find((method) =>
    /stripe/i.test(String(method.type ?? "")),
  );
  if (stripe) return stripe.id;
  const sessionBased = paymentMethods.find(
    (method) => method.session_required !== false,
  );
  return sessionBased?.id ?? paymentMethods[0]?.id ?? null;
}

export async function resolveSetupPaymentMethodId(): Promise<string | null> {
  try {
    const cart = await getCart();
    return findSetupPaymentMethodId(cart?.payment_methods);
  } catch {
    return null;
  }
}

export async function createPaymentSetupSession(paymentMethodId: string) {
  return actionResult(async () => {
    const session = await withAuthRefresh(async (options) => {
      return getClient().customer.paymentSetupSessions.create(
        { payment_method_id: paymentMethodId },
        options,
      );
    });
    return { session };
  }, "Failed to start card setup");
}

export async function completePaymentSetupSession(sessionId: string) {
  return actionResult(async () => {
    const session: PaymentSetupSession = await withAuthRefresh(
      async (options) => {
        return getClient().customer.paymentSetupSessions.complete(
          sessionId,
          {},
          options,
        );
      },
    );
    return { session };
  }, "Failed to save card");
}
