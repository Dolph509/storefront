import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SpreeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getMarketplaceHeroImageUrl } from "@/lib/marketplace-stock-images";

interface MarketplaceHeroSectionProps {
  basePath: string;
  locale: string;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
}

export async function MarketplaceHeroSection({
  basePath,
  locale,
  imageUrl,
  mobileImageUrl,
}: MarketplaceHeroSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  const desktopSrc = imageUrl?.trim() || getMarketplaceHeroImageUrl("desktop");
  const mobileSrc =
    mobileImageUrl?.trim() ||
    imageUrl?.trim() ||
    getMarketplaceHeroImageUrl("mobile");

  return (
    <section className="mx-auto mt-3 grid max-w-[1360px] overflow-hidden bg-marketplace-surface-warm md:mt-4 md:grid-cols-[42%_58%]">
      <div className="relative hidden md:order-last md:block md:aspect-auto md:min-h-[26rem]">
        <Image
          src={desktopSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 768px) 58vw, 100vw"
          priority
        />
      </div>
      <div className="relative order-first aspect-[4/3] w-full md:hidden">
        <Image
          src={mobileSrc}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      <div className="flex flex-col justify-center px-5 py-6 sm:px-8 md:py-10 lg:px-12">
        <div className="max-w-[29rem] md:pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-marketplace-brand">
            {t("marketplaceHeroEyebrow")}
          </p>
          <h1 className="mt-2 font-display text-[2rem] font-semibold leading-[0.98] tracking-tight text-marketplace-brand sm:text-[2.6rem] lg:text-[3rem]">
            {t("marketplaceHeroTitle")}
          </h1>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-marketplace-muted-foreground md:text-sm">
            {t("marketplaceHeroDescription")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="lg"
              className="h-8 rounded-md bg-marketplace-brand px-5 text-xs text-marketplace-brand-foreground hover:bg-marketplace-brand/90"
              asChild
            >
              <Link href={`${basePath}/products`}>
                {t("marketplaceHeroPrimaryCta")}
                <SpreeIcon name="forward" className="ml-1 size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-8 rounded-md border-marketplace-brand bg-white px-5 text-xs text-marketplace-brand hover:bg-white/90"
              asChild
            >
              <Link href={`${basePath}/products?q=gift`}>
                {t("marketplaceHeroSecondaryCta")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
