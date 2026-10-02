import { SpreeError } from "@spree/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { CmsPage } from "@/components/cms/types";
import { ThemeBuilderPreviewBridge } from "@/components/theme/ThemeBuilderPreviewBridge";
import { ThemePageRenderer } from "@/components/theme/ThemePageRenderer";
import { getCachedProduct, PRODUCT_PAGE_EXPAND } from "@/lib/data/cached";
import { getCategory } from "@/lib/data/categories";
import { getCollection } from "@/lib/data/collections";
import { resolveCurrency } from "@/lib/data/markets";
import { getMerchandisingPlacements } from "@/lib/data/merchandising";
import { getSellerStorefront } from "@/lib/data/sellers";
import { getClient } from "@/lib/spree";
import type { ThemeRenderContext } from "@/lib/theme/types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

interface Props {
  params: Promise<{ country: string; locale: string; token: string }>;
}

type ThemePreviewPayload = {
  theme: Parameters<typeof ThemePageRenderer>[0]["theme"];
  template: Parameters<typeof ThemePageRenderer>[0]["template"] | null;
  editor_origin: string | null;
  resource?: { type: string; id: string; slug?: string } | null;
};

async function resourceContext(
  preview: ThemePreviewPayload,
  base: Pick<ThemeRenderContext, "basePath" | "locale" | "country"> & {
    currency?: string;
  },
): Promise<ThemeRenderContext | null> {
  const resource = preview.resource;
  if (!resource) return null;
  const identifier = resource.slug || resource.id;

  try {
    switch (resource.type) {
      case "Spree::Product":
        return {
          ...base,
          kind: "product",
          product: await getCachedProduct(identifier, PRODUCT_PAGE_EXPAND),
        };
      case "Spree::Collection": {
        const collection = await getCollection(identifier);
        return {
          ...base,
          kind: "collection",
          collectionId: collection.id,
          collectionName: collection.name,
          collectionSlug: collection.permalink,
        };
      }
      case "Spree::Category": {
        const category = await getCategory(identifier);
        return {
          ...base,
          kind: "category",
          categoryId: category.id,
          categoryName: category.name,
          categorySlug: category.permalink,
        };
      }
      case "Spree::Seller": {
        const seller = await getSellerStorefront(identifier);
        return {
          ...base,
          kind: "seller",
          sellerSlug: seller.seller.slug,
          seller,
        };
      }
      case "Spree::CmsPage": {
        const response = await getClient().request<{ data: CmsPage }>(
          "GET",
          `/cms/pages/${encodeURIComponent(identifier)}`,
        );
        const page = response.data;
        return {
          ...base,
          kind: "page",
          pageId: page.id,
          pageSlug: page.slug,
          pageName: page.name,
          page,
        };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export default async function ThemePreviewRoute({ params }: Props) {
  await connection();
  const { country, locale, token } = await params;
  const basePath = `/${country}/${locale}`;
  const [currency, placements] = await Promise.all([
    resolveCurrency(country),
    getMerchandisingPlacements({ surface: "homepage" }),
  ]);

  let preview;
  try {
    const response = await getClient().request<{ data: ThemePreviewPayload }>(
      "GET",
      `/theme/previews/${encodeURIComponent(token)}`,
    );
    preview = response.data;
  } catch (error) {
    if (error instanceof SpreeError && error.status === 404) notFound();
    throw error;
  }

  const template = preview.template || {
    id: "preview",
    template_type: "home",
    key: "default",
    full_key: "home.default",
    name: "Preview",
    data: { sections: {}, order: [] },
  };
  const base = { basePath, locale, country, currency };
  const context: ThemeRenderContext | null =
    template.template_type === "home"
      ? { ...base, kind: "home", placements }
      : await resourceContext(preview, base);

  return (
    <>
      <ThemeBuilderPreviewBridge
        editorOrigin={preview.editor_origin}
        themeId={preview.theme.id}
        templateType={template.template_type}
        templateKey={template.key}
        baseTheme={preview.theme}
        baseTemplate={template}
      />
      {context ? (
        <ThemePageRenderer
          theme={preview.theme}
          template={template}
          context={context}
          chrome="full"
          editorMode
        />
      ) : (
        <main
          className="mx-auto max-w-2xl px-6 py-24 text-center"
          data-theme-preview-empty
        >
          <h1 className="text-xl font-semibold">
            This template needs a sample item to preview
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a product, collection, category, seller, or page to this store,
            then reopen the preview.
          </p>
        </main>
      )}
    </>
  );
}
