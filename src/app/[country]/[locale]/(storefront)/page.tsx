import type { Metadata } from "next";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { MarketplaceHomeSections } from "@/components/home/MarketplaceHomeSections";
import { MerchandisingHero } from "@/components/home/MerchandisingHero";
import { WholesaleSection } from "@/components/home/WholesaleSection";
import { resolveCurrency } from "@/lib/data/markets";
import { getMerchandisingPlacements } from "@/lib/data/merchandising";
import { firstPlacementOfKind } from "@/lib/merchandising-placements";
import { generateHomeMetadata } from "@/lib/metadata/home";

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
  const currency = await resolveCurrency(country);
  const placements = await getMerchandisingPlacements({ surface: "homepage" });
  const hero = firstPlacementOfKind(placements, "hero");

  return (
    <div>
      {hero ? (
        <MerchandisingHero placement={hero} basePath={basePath} />
      ) : (
        <HeroSection basePath={basePath} locale={locale} />
      )}
      <FeaturedProductsSection
        basePath={basePath}
        locale={locale}
        country={country}
        currency={currency}
      />
      <MarketplaceHomeSections
        basePath={basePath}
        locale={locale}
        country={country}
        currency={currency}
        placements={placements}
      />
      <WholesaleSection basePath={basePath} locale={locale} />
    </div>
  );
}
