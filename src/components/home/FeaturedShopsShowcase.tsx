import type { Seller } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { ShopCard } from "@/components/shops/ShopCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeaturedShopsShowcaseProps {
  sellers: Seller[];
  basePath: string;
  locale: string;
  countryLabel?: string;
  title?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export async function FeaturedShopsShowcase({
  sellers,
  basePath,
  locale,
  countryLabel,
  title,
  ctaHref = `${basePath}/shops`,
  ctaLabel,
}: FeaturedShopsShowcaseProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const displaySellers = sellers.slice(0, 3);
  if (displaySellers.length === 0) return null;

  const heading =
    title ??
    (countryLabel
      ? t("exploreShopsInCountry", { country: countryLabel })
      : t("exploreShops"));

  const [leadSeller, ...supportingSellers] = displaySellers;

  return (
    <MarketplaceSection
      surface="warm"
      className="bg-marketplace-canvas"
      data-theme-section="featured_shops"
    >
      <MarketplacePage>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:items-start lg:gap-10">
          <div className="lg:sticky lg:top-24">
            <MarketplaceSectionHeader
              title={heading}
              density="compact"
              className="mb-0 lg:mb-4"
            />
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-4 border-marketplace-brand text-marketplace-brand hover:bg-marketplace-surface",
              )}
            >
              {ctaLabel ?? t("viewTopFinds")}
            </Link>
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ShopCard
              seller={leadSeller}
              basePath={basePath}
              locale={locale}
              variant="rich"
              className="md:col-span-2 lg:col-span-1"
            />
            {supportingSellers.map((seller) => (
              <ShopCard
                key={seller.id}
                seller={seller}
                basePath={basePath}
                locale={locale}
                variant="compact"
              />
            ))}
          </div>
        </div>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
