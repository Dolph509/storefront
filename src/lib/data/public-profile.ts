"use server";

import { getClient, getLocaleOptions } from "@/lib/spree";

export interface PublicProfile {
  id: string;
  name: string;
  bio: string;
  other_accounts: string;
  avatar_url: string | null;
  shop: { name: string; slug: string } | null;
}

export async function getPublicProfile(id: string): Promise<PublicProfile> {
  const options = await getLocaleOptions();
  return getClient().request<PublicProfile>(
    "GET",
    `/customers/${encodeURIComponent(id)}/profile`,
    options,
  );
}
