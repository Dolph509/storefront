import type { CmsTheme, ThemeTemplatePayload } from "@spree/sdk";
import { cache } from "react";
import { getClient, getLocaleOptions } from "@/lib/spree";

async function loadPublishedTheme(): Promise<CmsTheme | null> {
  const options = await getLocaleOptions();
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await getClient().request<{ data: CmsTheme }>(
        "GET",
        "/theme",
        options,
      );
      return response.data;
    } catch (error) {
      lastError = error;
    }
  }
  if (process.env.NODE_ENV === "development") {
    console.warn("[theme] Published theme could not be loaded", lastError);
  }
  return null;
}

export const getActiveTheme = cache(loadPublishedTheme);

const getResolvedTemplateCached = cache(
  async (
    templateType: string,
    templateKey: string,
    resourceType: string,
    resourceId: string,
  ): Promise<ThemeTemplatePayload | null> => {
    const options = await getLocaleOptions();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const requestOptions = {
          ...options,
          resource_type: resourceType || undefined,
          resource_id: resourceId || undefined,
        };
        const query = new URLSearchParams();
        if (requestOptions.resource_type)
          query.set("resource_type", requestOptions.resource_type);
        if (requestOptions.resource_id)
          query.set("resource_id", requestOptions.resource_id);
        const suffix = query.toString() ? `?${query.toString()}` : "";
        const response = await getClient().request<{
          data: ThemeTemplatePayload;
        }>(
          "GET",
          `/theme/templates/${encodeURIComponent(templateType)}/${encodeURIComponent(templateKey)}${suffix}`,
          options,
        );
        return response.data;
      } catch {
        // Retry once when the API is slow to answer.
      }
    }
    return null;
  },
);

export async function getResolvedTemplate(params: {
  templateType: string;
  templateKey?: string;
  resourceType?: string;
  resourceId?: string;
}): Promise<ThemeTemplatePayload | null> {
  return getResolvedTemplateCached(
    params.templateType,
    params.templateKey || "default",
    params.resourceType ?? "",
    params.resourceId ?? "",
  );
}

export function themeGroupHasContent(document?: { order?: string[] }): boolean {
  return Boolean(document?.order?.length);
}

/** True when a seller template document includes the seller storefront body. */
export function themeTemplateHasSellerMain(document?: {
  order?: string[];
  sections?: Record<string, { type?: string }>;
}): boolean {
  if (!document?.order?.length || !document.sections) return false;
  return document.order.some((sectionId) => {
    const section = document.sections?.[sectionId];
    return section?.type === "seller_main";
  });
}
