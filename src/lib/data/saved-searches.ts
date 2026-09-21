"use server";

import { getAccessToken, getClient } from "@/lib/spree";
import { actionResult } from "./utils";

async function customerOptions() {
  const token = await getAccessToken();
  if (!token) throw new Error("SIGN_IN_REQUIRED");
  return { token };
}

export async function listSavedSearches(page = 1, limit = 25) {
  return actionResult(async () => {
    const options = await customerOptions();
    return getClient().savedSearches.list({ page, limit }, options);
  }, "Failed to load saved searches");
}

export async function createSavedSearch(input: {
  name: string;
  query?: string;
  filters?: Record<string, unknown>;
  notifications_enabled?: boolean;
}) {
  return actionResult(async () => {
    const options = await customerOptions();
    return getClient().savedSearches.create(input, options);
  }, "Failed to save search");
}

export async function updateSavedSearch(
  id: string,
  params: Record<string, unknown>,
) {
  return actionResult(async () => {
    const options = await customerOptions();
    return getClient().savedSearches.update(id, params, options);
  }, "Failed to update saved search");
}

export async function deleteSavedSearch(id: string) {
  return actionResult(async () => {
    const options = await customerOptions();
    await getClient().savedSearches.delete(id, options);
    return { ok: true as const };
  }, "Failed to delete saved search");
}
