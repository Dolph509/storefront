"use server";

import { getClient } from "@/lib/spree";

export async function subscribeToFooterNewsletter(email: string) {
  const normalizedEmail = email.trim();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Enter a valid email address.");
  }
  await getClient().newsletterSubscribers.create({ email: normalizedEmail });
}
