import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketplacePage } from "@/components/marketplace";
import { Button } from "@/components/ui/button";
import {
  getEditorialStockImage,
  getMarketplaceHeroImageUrl,
} from "@/lib/marketplace-stock-images";

interface MarketplaceHomeEditorialHeroProps {
  basePath: string;
  locale: string;
}

export async function MarketplaceHomeEditorialHero({
  basePath,
  locale,
}: MarketplaceHomeEditorialHeroProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  const desktopSrc = getMarketplaceHeroImageUrl("desktop");
  const mobileSrc = getMarketplaceHeroImageUrl("mobile");
  const detailSrc = getEditorialStockImage("gifts");

  const provenanceItems = [
    t("marketplaceHeroTrustShops"),
    t("marketplaceHeroTrustGifts"),
    t("marketplaceHeroTrustSecure"),
  ];

  return (
    <section
      className="relative border-b border-marketplace-border-subtle bg-marketplace-canvas"
      data-testid="marketplace-home-hero"
      data-theme-section="home-editorial-hero"
    >
      <MarketplacePage className="py-6 sm:py-9 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* Mobile primary photography right above the fold */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface-subtle lg:hidden">
            <Image
              src={mobileSrc}
              alt={t("marketplaceHeroTitle")}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>

          {/* Left editorial narrative column */}
          <div className="min-w-0 lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-marketplace-brand-accent">
              {t("marketplaceHeroEyebrow")}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.15rem,1.65rem+2.1vw,3.5rem)] font-normal leading-[1.06] tracking-[-0.025em] text-balance text-marketplace-foreground">
              {t("marketplaceHeroTitle")}
            </h1>
            <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.65] text-marketplace-muted-foreground sm:text-base">
              {t("marketplaceHeroDescription")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="min-h-11 rounded-[var(--marketplace-button-radius)] bg-marketplace-brand px-6 text-sm font-medium tracking-[0.01em] text-marketplace-brand-foreground hover:bg-marketplace-brand-accent"
                asChild
              >
                <Link href={`${basePath}/products`}>
                  {t("marketplaceHeroPrimaryCta")}
                  <ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="min-h-11 rounded-[var(--marketplace-button-radius)] border-marketplace-border bg-marketplace-surface px-5 text-sm font-medium text-marketplace-foreground hover:border-marketplace-brand hover:bg-marketplace-surface-subtle"
                asChild
              >
                <Link href={`${basePath}/shops`}>{t("viewAllShops")}</Link>
              </Button>
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-2 border-t border-marketplace-border-subtle pt-5 text-xs text-marketplace-muted-foreground sm:grid-cols-3 sm:gap-4">
              {provenanceItems.map((label) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-marketplace-brand-accent"
                    aria-hidden="true"
                  />
                  <span className="leading-snug">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right desktop gallery composition */}
          <div className="hidden lg:col-span-7 lg:grid lg:grid-cols-12 lg:items-end lg:gap-4">
            <div className="relative col-span-8 aspect-[4/4.4] overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface-subtle">
              <Image
                src={desktopSrc}
                alt={t("marketplaceHeroTitle")}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 38vw, 100vw"
                priority
              />
            </div>
            <div className="col-span-4 flex flex-col gap-4">
              <div className="relative aspect-[4/4.6] overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface-subtle">
                <Image
                  src={detailSrc}
                  alt={t("editorialGiftsTitle")}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 18vw, 100vw"
                  priority
                />
              </div>
              <Link
                href={`${basePath}/products?q=gift`}
                className="group block rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface p-4 transition-colors hover:border-marketplace-brand"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-marketplace-brand-accent">
                  {t("giftGuides")}
                </p>
                <p className="mt-1 font-display text-base leading-snug text-marketplace-foreground">
                  {t("editorialGiftsTitle")}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-marketplace-brand group-hover:text-marketplace-brand-accent">
                  {t("shopGiftGuide")}
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </MarketplacePage>
    </section>
  );
}
