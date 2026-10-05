"use server";

import { getClient, withAuthRefresh } from "@/lib/spree";
import { updateCustomer } from "./customer";
import { actionResult } from "./utils";

export async function updateEmailMarketingPreference(enabled: boolean) {
  return updateCustomer({ accepts_email_marketing: enabled });
}

export async function unsubscribeNewsletter(subscriberId: string) {
  return actionResult(async () => {
    await withAuthRefresh(async (options) => {
      return getClient().newsletterSubscribers.delete(
        subscriberId,
        undefined,
        options,
      );
    });
    return {};
  }, "Failed to unsubscribe");
}

export async function subscribeNewsletter(email: string) {
  return actionResult(async () => {
    await withAuthRefresh(async (options) => {
      return getClient().newsletterSubscribers.create({ email }, options);
    });
    return {};
  }, "Failed to subscribe");
}
