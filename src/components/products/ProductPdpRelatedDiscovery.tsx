import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { PdpDiscoveryLinkList } from "@/components/products/PdpDiscoveryLinkList";
import type { PdpRelatedDiscoveryContext } from "@/lib/pdp/load-related-discovery";

export function PdpRelatedDiscoveryChips({
  plan,
  coverByItemKey,
}: PdpRelatedDiscoveryContext) {
  if (!plan.chips.length) return null;

  return (
    <MarketplaceSection data-pdp-related-search-chips>
      <MarketplacePage className="bg-transparent">
        <PdpDiscoveryLinkList
          items={plan.chips}
          coverByItemKey={coverByItemKey}
          variant="circle"
          className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        />
      </MarketplacePage>
    </MarketplaceSection>
  );
}

export async function PdpRelatedDiscoveryExplore({
  plan,
  coverByItemKey,
  locale,
  showExploreHeading = true,
}: PdpRelatedDiscoveryContext & {
  locale: string;
  showExploreHeading?: boolean;
}) {
  if (!plan.gridTiles.length && !plan.pills.length) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "products",
  });

  return (
    <>
      {plan.gridTiles.length ? (
        <MarketplaceSection data-pdp-explore-related-searches>
          <MarketplacePage className="bg-transparent">
            {showExploreHeading ? (
              <MarketplaceSectionHeader
                title={t("pdpExploreRelatedSearches")}
                density="etsy"
                className="mb-4"
              />
            ) : null}
            <PdpDiscoveryLinkList
              items={plan.gridTiles}
              coverByItemKey={coverByItemKey}
              variant="tile"
              className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3 xl:grid-cols-6"
            />
          </MarketplacePage>
        </MarketplaceSection>
      ) : null}

      {plan.pills.length ? (
        <MarketplaceSection data-pdp-explore-more-related-searches>
          <MarketplacePage className="bg-transparent">
            <MarketplaceSectionHeader
              title={t("pdpExploreMoreRelatedSearches")}
              density="etsy"
              className="mb-3"
            />
            <ul className="flex flex-wrap gap-2.5">
              {plan.pills.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="inline-flex rounded-full bg-marketplace-muted px-4 py-2.5 text-sm font-semibold text-marketplace-foreground transition-colors hover:bg-marketplace-surface-warm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </MarketplacePage>
        </MarketplaceSection>
      ) : null}
    </>
  );
}
