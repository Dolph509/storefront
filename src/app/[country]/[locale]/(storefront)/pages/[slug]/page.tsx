import { SpreeError } from "@spree/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";
import type { CmsPage } from "@/components/cms/types";
import { resolveCurrency } from "@/lib/data/markets";
import { getClient } from "@/lib/spree";

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
  const [page, currency] = await Promise.all([
    pageFor(slug),
    resolveCurrency(country),
  ]);
  return (
    <CmsPageRenderer
      page={page}
      basePath={`/${country}/${locale}`}
      locale={locale}
      currency={currency}
    />
  );
}
