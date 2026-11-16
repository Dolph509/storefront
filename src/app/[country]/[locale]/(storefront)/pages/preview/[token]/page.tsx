import { SpreeError } from "@spree/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";
import { CmsPreviewBridge } from "@/components/cms/CmsPreviewBridge";
import type { CmsPage } from "@/components/cms/types";
import { resolveCurrency } from "@/lib/data/markets";
import { getClient } from "@/lib/spree";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

interface Props {
  params: Promise<{ country: string; locale: string; token: string }>;
}

export default async function CmsPreviewRoute({ params }: Props) {
  await connection();
  const { country, locale, token } = await params;
  let page;
  let editorOrigin: string | null = null;
  try {
    const response = await getClient().request<{
      data: CmsPage;
      editor_origin: string | null;
    }>("GET", `/cms/previews/${encodeURIComponent(token)}`);
    page = response.data;
    editorOrigin = response.editor_origin;
  } catch (error) {
    if (error instanceof SpreeError && error.status === 404) notFound();
    throw error;
  }
  const currency = await resolveCurrency(country);
  return (
    <>
      <CmsPreviewBridge editorOrigin={editorOrigin} pageId={page.id} />
      <CmsPageRenderer
        page={page}
        basePath={`/${country}/${locale}`}
        locale={locale}
        currency={currency}
      />
    </>
  );
}
