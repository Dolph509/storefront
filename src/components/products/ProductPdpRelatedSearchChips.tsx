import type { Product } from "@spree/sdk";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";
import { PdpDiscoveryLinkCard } from "@/components/products/PdpDiscoveryLinkCard";
import {
  resolveCategoryCoverMap,
  resolveSearchCoverMap,
} from "@/lib/data/pdp-discovery-cover";
import { buildChipDiscoveryItems } from "@/lib/pdp/discovery-items";

export async function ProductPdpRelatedSearchChips({
  product,
  basePath,
  limit = 6,
}: {
  product: Product;
  basePath: string;
  locale: string;
  limit?: number;
}) {
  const items = buildChipDiscoveryItems(product, basePath, limit);
  if (!items.length) return null;

  const categories = items
    .map((item) => item.category)
    .filter((category): category is NonNullable<typeof category> =>
      Boolean(category),
    );
  const searchTerms = items
    .filter((item) => item.kind === "search")
    .map((item) => item.label);

  const [categoryCovers, searchCovers] = await Promise.all([
    resolveCategoryCoverMap(categories),
    resolveSearchCoverMap(searchTerms),
  ]);

  return (
    <MarketplaceSection data-pdp-related-search-chips>
      <MarketplacePage className="bg-transparent">
        <ul className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const imageUrl = item.category
              ? (categoryCovers.get(item.category.id) ?? null)
              : (searchCovers.get(item.label.toLowerCase()) ?? null);
            return (
              <li key={item.key} className="shrink-0">
                <PdpDiscoveryLinkCard
                  href={item.href}
                  label={item.label}
                  imageUrl={imageUrl}
                  variant="circle"
                />
              </li>
            );
          })}
        </ul>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
