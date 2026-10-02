import { SpreeError } from "@spree/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WishlistPageContent } from "@/components/account/WishlistPageContent";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";
import type { CmsPage } from "@/components/cms/types";
import { ThemePageRenderer } from "@/components/theme/ThemePageRenderer";
import { resolveCurrency } from "@/lib/data/markets";
import { getClient } from "@/lib/spree";
import { themeTemplatePageEnabled } from "@/lib/theme/flags";
import {
  getActiveTheme,
  getResolvedTemplate,
  themeGroupHasContent,
} from "@/lib/theme/resolver";
import { isConfiguredWishlistPage } from "@/lib/theme/wishlist";

interface Props {
  params: Promise<{ country: string; locale: string; slug: string }>;
}

async function pageFor(slug: string) {
  try {
    const response = await getClient().request<{ data: CmsPage }>(
      "GET",
      `/cms/pages/${encodeURIComponent(slug)}`,
    );
    return response.data;
  } catch (error) {
    if (error instanceof SpreeError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await pageFor(slug);
  return {
    title: page.seo.title || page.name,
    description: page.seo.description || undefined,
  };
}

export default async function CmsPageRoute({ params }: Props) {
  const { country, locale, slug } = await params;
  const [page, currency, theme] = await Promise.all([
    pageFor(slug),
    resolveCurrency(country),
    themeTemplatePageEnabled() ? getActiveTheme() : Promise.resolve(null),
  ]);
  const general = (theme?.settings as Record<string, unknown> | undefined)
    ?.general as Record<string, unknown> | undefined;
  if (isConfiguredWishlistPage(general, page.slug)) {
    return <WishlistPageContent country={country} locale={locale} />;
  }
  if (theme && themeTemplatePageEnabled()) {
    const template = await getResolvedTemplate({
      templateType: "page",
      templateKey: "default",
      resourceType: "Spree::CmsPage",
      resourceId: page.id,
    });
    if (template && themeGroupHasContent(template.data)) {
      return (
        <ThemePageRenderer
          theme={theme}
          template={template}
          context={{
            kind: "page",
            pageId: page.id,
            pageSlug: page.slug,
            pageName: page.name,
            page,
            basePath: `/${country}/${locale}`,
            locale,
            country,
            currency,
          }}
        />
      );
    }
  }
  return (
    <CmsPageRenderer
      page={page}
      basePath={`/${country}/${locale}`}
      locale={locale}
      currency={currency}
    />
  );
}
