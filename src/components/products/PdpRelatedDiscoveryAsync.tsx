import type { Product } from "@spree/sdk";
import {
  PdpRelatedDiscoveryChips,
  PdpRelatedDiscoveryExplore,
} from "@/components/products/ProductPdpRelatedDiscovery";
import { loadPdpRelatedDiscovery } from "@/lib/pdp/load-related-discovery";

export async function PdpRelatedDiscoveryChipsAsync({
  product,
  basePath,
}: {
  product: Product;
  basePath: string;
}) {
  const relatedDiscovery = await loadPdpRelatedDiscovery(product, basePath);
  return <PdpRelatedDiscoveryChips {...relatedDiscovery} />;
}

export async function PdpRelatedDiscoveryExploreAsync({
  product,
  basePath,
  locale,
  showExploreHeading = true,
}: {
  product: Product;
  basePath: string;
  locale: string;
  showExploreHeading?: boolean;
}) {
  const relatedDiscovery = await loadPdpRelatedDiscovery(product, basePath);
  return (
    <PdpRelatedDiscoveryExplore
      {...relatedDiscovery}
      locale={locale}
      showExploreHeading={showExploreHeading}
    />
  );
}
