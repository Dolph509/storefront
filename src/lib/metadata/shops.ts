import type { Metadata } from "next";
import { buildHreflangLanguages } from "@/lib/metadata/alternates";
import { buildCanonicalUrl, SOCIAL_IMAGE_PATH } from "@/lib/seo";
import {
  getStoreMetaDescription,
  getStoreSeoTitle,
  getStoreUrl,
} from "@/lib/store";

interface ShopsMetadataParams {
  country: string;
  locale: string;
}

export async function generateShopsMetadata({
  country,
  locale,
}: ShopsMetadataParams): Promise<Metadata> {
  const storeName = getStoreSeoTitle();
  const description = getStoreMetaDescription();
  const storeUrl = getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(storeUrl, `/${country}/${locale}/shops`)
    : undefined;
  const languages = storeUrl
    ? await buildHreflangLanguages({
        storeUrl,
        country,
        locale,
        path: "/shops",
      })
    : undefined;

  const title = `Shops | ${storeName}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: SOCIAL_IMAGE_PATH }],
    },
  };
}
