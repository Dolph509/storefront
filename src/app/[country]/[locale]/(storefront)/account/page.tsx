import { AccountOverviewRecommendations } from "@/components/account/AccountOverviewRecommendations";
import { SponsoredDiscoveryRailSection } from "@/components/ads/SponsoredDiscoveryRailSection";
import { getAccessToken } from "@/lib/spree/cookies";
import { AccountPageClient } from "./AccountPageClient";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const token = await getAccessToken();

  const discovery = token ? (
    <>
      <AccountOverviewRecommendations
        country={country}
        locale={locale}
        basePath={basePath}
      />
      <SponsoredDiscoveryRailSection
        placement="account_discovery"
        titleKey="sponsoredDiscovery"
        titleNamespace="account"
        basePath={basePath}
        locale={locale}
        limit={8}
        className="mt-10"
      />
    </>
  ) : undefined;

  return <AccountPageClient discovery={discovery} />;
}
