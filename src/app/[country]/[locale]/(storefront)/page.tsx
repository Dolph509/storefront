import type { Metadata } from "next";
import { HomeMarketplaceNarrative } from "@/components/home/HomeMarketplaceNarrative";
import { MarketplaceHeroSection } from "@/components/home/MarketplaceHeroSection";
import { MerchandisingImpression } from "@/components/home/MerchandisingTracker";
import { ThemePageRenderer } from "@/components/theme/ThemePageRenderer";
import { getCategories } from "@/lib/data/categories";
import { resolveCurrency } from "@/lib/data/markets";
import { getMerchandisingPlacements } from "@/lib/data/merchandising";
import { firstPlacementOfKind } from "@/lib/merchandising-placements";
import { generateHomeMetadata } from "@/lib/metadata/home";
import { themeTemplateHomeEnabled } from "@/lib/theme/flags";
import { getActiveTheme, getResolvedTemplate } from "@/lib/theme/resolver";

interface HomePageProps {
  params: Promise<{
    country: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { country, locale } = await params;
  return generateHomeMetadata({ country, locale });
}

export default async function HomePage({ params }: HomePageProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const [currency, placements, categoriesResponse] = await Promise.all([
    resolveCurrency(country),
    getMerchandisingPlacements({ surface: "homepage" }),
    getCategories(
      { depth_eq: 0, expand: ["children.children"] },
      { country, locale },
    ).catch(() => ({ data: [] })),
  ]);
  const hero = firstPlacementOfKind(placements, "hero");

  if (themeTemplateHomeEnabled()) {
    const [theme, template] = await Promise.all([
      getActiveTheme(),
      getResolvedTemplate({ templateType: "home", templateKey: "default" }),
    ]);
    if (theme && template) {
      return (
        <div className="bg-marketplace-background">
          <ThemePageRenderer
            theme={theme}
            template={template}
            context={{ kind: "home", basePath, locale, country, currency }}
          />
        </div>
      );
    }
  }

  return (
    <div className="bg-marketplace-background">
      {hero ? (
        <MerchandisingImpression
          event="campaign_impression"
          payload={{ campaign_id: hero.campaign_id, placement_id: hero.id }}
        />
      ) : null}
      <MarketplaceHeroSection
        basePath={basePath}
        locale={locale}
        imageUrl={hero?.image_url}
        mobileImageUrl={hero?.mobile_image_url}
      />
      <HomeMarketplaceNarrative
        basePath={basePath}
        locale={locale}
        country={country}
        currency={currency}
        placements={placements}
        rootCategories={categoriesResponse.data}
      />
    </div>
  );
}
