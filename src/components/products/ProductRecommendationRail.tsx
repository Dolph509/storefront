import type { Product } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ComponentProps } from "react";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { RecommendationDismissibleCarousel } from "@/components/products/RecommendationDismissibleCarousel";
import { RecommendationListAnalytics } from "@/components/products/RecommendationListAnalytics";
import { Button } from "@/components/ui/button";
import type { RecommendationSurface } from "@/lib/analytics/recommendation-attribution";
import type { ListDiscoveryOptions } from "@/lib/discovery/types";

export type RecommendationSource =
  | "similar"
  | "shop"
  | "trending"
  | "new"
  | "followed_shops";

interface ProductRecommendationRailProps {
  title: string;
  eyebrow?: string;
  products: Product[];
  basePath: string;
  currency?: string;
  listId: string;
  listName: string;
  listDiscovery?: ListDiscoveryOptions;
  moreHref?: string;
  moreLabel?: string;
  variant?: "default" | "etsy";
  mobileSlidesPerView?: number;
  homeRailKey?: "recommended-for-you" | "similar-to-saved";
  dismissSurface?: string;
  dismissible?: boolean;
  analyticsSurface?: RecommendationSurface;
  personalized?: boolean;
  experiment?: string | null;
  suppressRelevanceReason?: boolean;
  surface?: ComponentProps<typeof MarketplaceSection>["surface"];
}

export async function ProductRecommendationRail({
  title,
  eyebrow,
  products,
  basePath,
  currency,
  listId,
  listName,
  moreHref,
  moreLabel,
  variant = "default",
  mobileSlidesPerView,
  homeRailKey,
  dismissSurface,
  dismissible = true,
  analyticsSurface,
  personalized = false,
  experiment,
  suppressRelevanceReason = false,
  surface,
}: ProductRecommendationRailProps) {
  const recommendationClick =
    analyticsSurface != null
      ? {
          surface: analyticsSurface,
          listId,
          personalized,
          experiment,
        }
      : undefined;
  if (!products.length) return null;

  const t = await getTranslations("home");

  return (
    <MarketplaceSection
      surface={surface}
      className={variant === "etsy" ? "py-5 sm:py-9 md:py-11" : undefined}
      data-home-rail={homeRailKey}
    >
      <MarketplacePage>
        {analyticsSurface ? (
          <RecommendationListAnalytics
            products={products}
            listId={listId}
            listName={listName}
            currency={currency ?? "USD"}
            surface={analyticsSurface}
            personalized={personalized}
            experiment={experiment}
          />
        ) : null}
        <MarketplaceSectionHeader
          eyebrow={eyebrow}
          title={title}
          density={variant === "etsy" ? "home" : "default"}
          action={
            moreHref ? (
              <Button
                variant="link"
                className="h-auto px-0 text-sm font-medium text-marketplace-brand hover:text-marketplace-brand-accent"
                asChild
              >
                <Link href={moreHref}>{moreLabel ?? `${t("viewAll")} →`}</Link>
              </Button>
            ) : null
          }
        />
        {dismissible && (homeRailKey || dismissSurface || personalized) ? (
          <RecommendationDismissibleCarousel
            products={products}
            basePath={basePath}
            currency={currency}
            listId={listId}
            listName={listName}
            variant={variant}
            mobileSlidesPerView={mobileSlidesPerView}
            homeRailSection={homeRailKey}
            dismissSurface={
              dismissSurface ??
              (homeRailKey ? `home_rail:${homeRailKey}` : `rail:${listId}`)
            }
            recommendationClick={recommendationClick}
            suppressRelevanceReason={suppressRelevanceReason}
          />
        ) : (
          <ProductCarousel
            products={products}
            basePath={basePath}
            currency={currency}
            listId={listId}
            listName={listName}
            variant={variant}
            mobileSlidesPerView={mobileSlidesPerView}
            homeRailSection={homeRailKey}
            recommendationClick={recommendationClick}
            suppressRelevanceReason={suppressRelevanceReason}
          />
        )}
      </MarketplacePage>
    </MarketplaceSection>
  );
}
