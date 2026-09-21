import type { Metadata } from "next";
import { getCollection } from "@/lib/data/collections";
import { getStoreUrl } from "@/lib/store";

export async function generateCollectionMetadata({
  country,
  locale,
  slug,
}: {
  country: string;
  locale: string;
  slug: string;
}): Promise<Metadata> {
  let collection;
  try {
    collection = await getCollection(slug);
  } catch {
    return { title: "Collection Not Found" };
  }

  const title = collection.meta_title || collection.name;
  const description =
    collection.meta_description ||
    collection.short_description ||
    collection.description ||
    `Shop ${collection.name}.`;
  const storeUrl = getStoreUrl();
  const canonical = storeUrl
    ? `${storeUrl.replace(/\/$/, "")}/${country}/${locale}/collections/${collection.permalink}`
    : undefined;

  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      description,
      ...(canonical ? { url: canonical } : {}),
      type: "website",
      ...(collection.image_url
        ? { images: [{ url: collection.image_url, alt: collection.name }] }
        : {}),
    },
  };
}
