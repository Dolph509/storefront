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
      className="bg-marketplace-background py-10 md:py-14"
      data-theme-section="editorial"
    >
      <MarketplacePage>
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="group grid overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface sm:grid-cols-[44%_56%]">
            <div className="relative min-h-[14rem] bg-marketplace-surface-subtle">
              <Image
                src={getEditorialStockImage("makers")}
                alt={t("editorialMakersTitle")}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </div>
            <div className="flex flex-col justify-between p-6 md:p-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-marketplace-brand-accent">
                  {t("featuredShops")}
                </p>
                <h3 className="mt-2 font-display text-2xl font-normal leading-tight text-marketplace-foreground">
                  {t("editorialMakersTitle")}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-marketplace-muted-foreground">
                  {t("editorialMakersDescription")}
                </p>
              </div>
              <Link
                href={`${basePath}/shops`}
                className="mt-5 inline-flex w-fit items-center gap-1.5 border-b border-marketplace-brand pb-0.5 text-sm font-medium text-marketplace-brand transition-colors hover:border-marketplace-brand-accent hover:text-marketplace-brand-accent"
              >
                {t("meetOurSellers")}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="group grid overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface-warm sm:grid-cols-[54%_46%]">
            <div className="flex flex-col justify-between p-6 md:p-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-marketplace-brand-accent">
                  {t("giftGuides")}
                </p>
                <h3 className="mt-2 font-display text-2xl font-normal leading-tight text-marketplace-foreground">
                  {t("editorialGiftsTitle")}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-marketplace-muted-foreground">
                  {t("editorialGiftsDescription")}
                </p>
              </div>
              <Link
                href={`${basePath}/products?q=gift`}
                className="mt-5 inline-flex w-fit items-center gap-1.5 border-b border-marketplace-brand pb-0.5 text-sm font-medium text-marketplace-brand transition-colors hover:border-marketplace-brand-accent hover:text-marketplace-brand-accent"
              >
                {t("shopGiftGuide")}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="relative min-h-[14rem] bg-marketplace-surface-subtle max-sm:order-first">
              <Image
                src={getEditorialStockImage("gifts")}
                alt={t("editorialGiftsTitle")}
                fill
                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </div>
          </article>
        </div>
      </MarketplacePage>
    </section>
  );
}
