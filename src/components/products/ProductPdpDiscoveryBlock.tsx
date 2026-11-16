import type { Product, SponsoredSearchResult } from "@spree/sdk";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { ProductPdpMixedDiscoveryGrid } from "@/components/products/ProductPdpMixedDiscoveryGrid";
import { RecommendationListAnalytics } from "@/components/products/RecommendationListAnalytics";
import { Button } from "@/components/ui/button";
import type { RecommendationSurface } from "@/lib/analytics/recommendation-attribution";

type ProductPdpDiscoveryBlockProps = {
  title: ReactNode;
  includingAdsLabel?: string;
  products: Product[];
  sponsoredRows?: SponsoredSearchResult[];
  basePath: string;
  currency?: string;
  listId: string;
  listName: string;
  moreHref?: string;
  moreLabel?: string;
  analyticsSurface?: RecommendationSurface;
  personalized?: boolean;
  sectionKey: string;
};

export function ProductPdpDiscoveryBlock({
  title,
  includingAdsLabel,
  products,
  sponsoredRows = [],
  basePath,
  currency,
  listId,
  listName,
  moreHref,
  moreLabel,
  analyticsSurface = "pdp",
  personalized = false,
  sectionKey,
}: ProductPdpDiscoveryBlockProps) {
  if (!products.length && !sponsoredRows.length) return null;

  const recommendationClick =
    analyticsSurface != null
      ? {
          surface: analyticsSurface,
          listId,
          personalized,
          experiment: null,
        }
      : undefined;

  const heading = (
    <>
      {title}
      {includingAdsLabel ? (
        <span className="ml-2 text-base font-normal text-marketplace-muted-foreground">
          {includingAdsLabel}
        </span>
      ) : null}
    </>
  );

  return (
    <MarketplaceSection data-pdp-discovery-section={sectionKey}>
      <MarketplacePage className="bg-transparent">
        {products.length > 0 ? (
          <RecommendationListAnalytics
            products={products}
            listId={listId}
            listName={listName}
            currency={currency ?? "USD"}
            surface={analyticsSurface}
            personalized={personalized}
          />
        ) : null}
        <MarketplaceSectionHeader
          title={heading}
          density="etsy"
          className="mb-3"
          action={
            moreHref && moreLabel ? (
              <Button variant="link" className="h-auto px-0 text-sm" asChild>
                <Link href={moreHref}>{moreLabel}</Link>
              </Button>
            ) : null
          }
        />
        <ProductPdpMixedDiscoveryGrid
          organic={products}
          sponsoredRows={sponsoredRows}
          basePath={basePath}
          currency={currency}
          listId={listId}
          listName={listName}
          recommendationClick={recommendationClick}
        />
      </MarketplacePage>
    </MarketplaceSection>
  );
}
