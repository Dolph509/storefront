"use server";

import { getClient, getLocaleOptions } from "@/lib/spree";

export type CmsNavigationPayload = {
  key: string;
  items: Array<{
    id: string;
    type: string;
    label: string;
    target?: string;
    category_id?: string;
    collection_id?: string;
    seller_id?: string;
    cms_page_id?: string;
    enabled?: boolean;
    children?: CmsNavigationPayload["items"];
  }>;
};

export async function getPublishedNavigation(
  key: string,
): Promise<CmsNavigationPayload | null> {
  const options = await getLocaleOptions();
  try {
    const response = await getClient().request<{ data: CmsNavigationPayload }>(
      "GET",
      `/cms/navigations/${encodeURIComponent(key)}`,
      options,
    );
    return response.data;
  } catch {
    return null;
  }
}
