import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketplacePage } from "@/components/marketplace";
import { getEditorialStockImage } from "@/lib/marketplace-stock-images";

interface HomeEditorialBannersProps {
  basePath: string;
  locale: string;
}

export async function HomeEditorialBanners({
  basePath,
  locale,
}: HomeEditorialBannersProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  return (
    <section
      className="bg-marketplace-background py-6 md:py-14"
      data-theme-section="editorial"
    >
      <MarketplacePage>
        <div className="grid gap-3 sm:gap-5 lg:grid-cols-2">
          <article className="group grid grid-cols-[38%_62%] overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface sm:grid-cols-[44%_56%]">
            <div className="relative min-h-[7.5rem] bg-marketplace-surface-subtle sm:min-h-[14rem]">
              <Image
                src={getEditorialStockImage("makers")}
                alt={t("editorialMakersTitle")}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 38vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </div>
            <div className="flex flex-col justify-between p-3.5 sm:p-6 md:p-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-marketplace-brand-accent sm:text-[11px] sm:tracking-[0.16em]">
                  {t("featuredShops")}
                </p>
                <h3 className="mt-1 font-display text-lg font-normal leading-tight text-marketplace-foreground sm:mt-2 sm:text-2xl">
                  {t("editorialMakersTitle")}
                </h3>
                <p className="mt-1.5 hidden text-sm leading-relaxed text-marketplace-muted-foreground sm:mt-2.5 sm:block">
                  {t("editorialMakersDescription")}
                </p>
              </div>
              <Link
                href={`${basePath}/shops`}
                className="mt-3 inline-flex w-fit items-center gap-1.5 border-b border-marketplace-brand pb-0.5 text-xs font-medium text-marketplace-brand transition-colors hover:border-marketplace-brand-accent hover:text-marketplace-brand-accent sm:mt-5 sm:text-sm"
              >
                {t("meetOurSellers")}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="group grid grid-cols-[62%_38%] overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface sm:grid-cols-[54%_46%]">
            <div className="flex flex-col justify-between p-3.5 sm:p-6 md:p-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-marketplace-brand-accent sm:text-[11px] sm:tracking-[0.16em]">
                  {t("giftGuides")}
                </p>
                <h3 className="mt-1 font-display text-lg font-normal leading-tight text-marketplace-foreground sm:mt-2 sm:text-2xl">
                  {t("editorialGiftsTitle")}
                </h3>
                <p className="mt-1.5 hidden text-sm leading-relaxed text-marketplace-muted-foreground sm:mt-2.5 sm:block">
                  {t("editorialGiftsDescription")}
                </p>
              </div>
              <Link
                href={`${basePath}/products?q=gift`}
                className="mt-3 inline-flex w-fit items-center gap-1.5 border-b border-marketplace-brand pb-0.5 text-xs font-medium text-marketplace-brand transition-colors hover:border-marketplace-brand-accent hover:text-marketplace-brand-accent sm:mt-5 sm:text-sm"
              >
                {t("shopGiftGuide")}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="relative min-h-[7.5rem] bg-marketplace-surface-subtle sm:min-h-[14rem]">
              <Image
                src={getEditorialStockImage("gifts")}
                alt={t("editorialGiftsTitle")}
                fill
                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 38vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </div>
          </article>
        </div>
      </MarketplacePage>
    </section>
  );
}
