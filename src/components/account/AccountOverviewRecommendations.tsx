import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import {
  getFollowedShopProducts,
  getPersonalizedDiscoveryProducts,
  getSimilarToSavedProducts,
} from "@/lib/data/recommendations";
import { getAccessToken } from "@/lib/spree/cookies";

export async function AccountOverviewRecommendations({
  locale,
  basePath,
}: {
  locale: string;
  country: string;
  basePath: string;
}) {
  const token = await getAccessToken();
  if (!token) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "account",
  });

  const [forYou, inspired, followed] = await Promise.all([
    getPersonalizedDiscoveryProducts({ surface: "account" }),
    getSimilarToSavedProducts(),
    getFollowedShopProducts(),
  ]);

  const rails: ReactNode[] = [];

  if (forYou.products.length > 0) {
    rails.push(
      <ProductRecommendationRail
        key="for-you"
        title={t("discoveryContinueExploring")}
        products={forYou.products}
        basePath={basePath}
        listId="account-for-you"
        listName={t("discoveryContinueExploring")}
        variant="etsy"
        dismissSurface="account:for_you"
        analyticsSurface="account"
        personalized={forYou.personalized}
      />,
    );
  }

  if (inspired.length > 0) {
    rails.push(
      <ProductRecommendationRail
        key="inspired"
        title={t("discoveryInspiredBySaved")}
        products={inspired}
        basePath={basePath}
        listId="account-inspired"
        listName={t("discoveryInspiredBySaved")}
        variant="etsy"
        dismissSurface="account:inspired"
        analyticsSurface="account"
        personalized
      />,
    );
  }

  if (followed.length > 0) {
    rails.push(
      <ProductRecommendationRail
        key="followed"
        title={t("discoveryFollowedShops")}
        products={followed}
        basePath={basePath}
        listId="account-followed-shops"
        listName={t("discoveryFollowedShops")}
        variant="etsy"
        dismissSurface="account:followed_shops"
        analyticsSurface="account"
        personalized
      />,
    );
  }

  if (!rails.length) return null;

  return (
    <section
      aria-labelledby="account-discovery-heading"
      className="space-y-8 border-t border-marketplace-border-subtle pt-8"
    >
      <h2
        id="account-discovery-heading"
        className="text-xs font-semibold uppercase tracking-wider text-marketplace-muted-foreground"
      >
        {t("discoverySectionTitle")}
      </h2>
      <div className="space-y-6">{rails}</div>
    </section>
  );
}
