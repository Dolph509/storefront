import { getTranslations } from "next-intl/server";
import { SponsoredDiscoveryRail } from "@/components/ads/SponsoredDiscoveryRail";
import type { DiscoveryAdsPlacement } from "@/lib/ads/placements";
import { fetchDiscoveryPlacements } from "@/lib/data/ads-placements";

type SponsoredDiscoveryRailSectionProps = {
  placement: DiscoveryAdsPlacement;
  titleKey: string;
  titleNamespace: string;
  basePath: string;
  locale: string;
  currency?: string;
  limit?: number;
  productId?: string;
  categoryId?: string;
  collectionId?: string;
  sellerId?: string;
  organicProductIds?: string[];
  className?: string;
};

export async function SponsoredDiscoveryRailSection({
  placement,
  titleKey,
  titleNamespace,
  basePath,
  locale,
  currency,
  limit,
  productId,
  categoryId,
  collectionId,
  sellerId,
  organicProductIds,
  className,
}: SponsoredDiscoveryRailSectionProps) {
  const rows = await fetchDiscoveryPlacements({
    placement,
    limit,
    product_id: productId,
    category_id: categoryId,
    collection_id: collectionId,
    seller_id: sellerId,
    organic_product_ids: organicProductIds,
    currency,
  });
  if (!rows.length) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: titleNamespace,
  });

  return (
    <SponsoredDiscoveryRail
      placement={placement}
      title={t(titleKey)}
      basePath={basePath}
      currency={currency}
      limit={limit}
      productId={productId}
      categoryId={categoryId}
      collectionId={collectionId}
      sellerId={sellerId}
      organicProductIds={organicProductIds}
      className={className}
      initialRows={rows}
    />
  );
}
