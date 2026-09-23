import type { Seller } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FeaturedShopCard } from "@/components/shops/FeaturedShopCard";

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

  return (
    <section className="bg-marketplace-featured-shops py-10 md:py-12 lg:py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10 xl:gap-14">
          <div className="shrink-0 lg:max-w-[16rem] xl:max-w-[18rem]">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#222] md:text-[1.65rem]">
              {heading}
            </h2>
            <Link
              href={ctaHref}
              className="mt-6 inline-flex rounded-full bg-[#eaeaea] px-6 py-3 text-sm font-bold text-[#222] transition-colors hover:bg-[#dedede]"
            >
              {ctaLabel ?? t("viewTopFinds")}
            </Link>
          </div>

          <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-2 sm:gap-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {displaySellers.map((seller, index) => (
              <FeaturedShopCard
                key={seller.id}
                seller={seller}
                basePath={basePath}
                locale={locale}
                showVisualSearch={index === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
