import type { CmsTheme, ThemeTemplatePayload } from "@spree/sdk";
import { getClient, getLocaleOptions } from "@/lib/spree";

export async function getActiveTheme(): Promise<CmsTheme | null> {
  const options = await getLocaleOptions();
  try {
    return await getClient().cms.theme.get(options);
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[theme] No published theme; using legacy storefront chrome",
      );
    }
    return null;
  }
}

export async function getResolvedTemplate(params: {
  templateType: string;
  templateKey?: string;
  resourceType?: string;
  resourceId?: string;
}): Promise<ThemeTemplatePayload | null> {
  const options = await getLocaleOptions();
  try {
    return await getClient().cms.theme.template.get(
      params.templateType,
      params.templateKey || "default",
      {
        ...options,
        resource_type: params.resourceType,
        resource_id: params.resourceId,
      },
    );
  } catch {
    return null;
  }
}

export function themeGroupHasContent(document?: { order?: string[] }): boolean {
  return Boolean(document?.order?.length);
}
