import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
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
    <section className="bg-marketplace-background py-12 md:py-16">
      <div className="mx-auto grid max-w-[1360px] gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:px-0">
        <article className="grid min-h-[11rem] overflow-hidden rounded-md bg-marketplace-surface sm:grid-cols-[43%_57%]">
          <div className="relative min-h-[10rem]">
            <Image
              src={getEditorialStockImage("makers")}
              alt=""
              fill
              sizes="(min-width: 640px) 22vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-5 md:p-6">
            <h3 className="font-display text-2xl font-semibold leading-tight text-marketplace-brand">
              {t("editorialMakersTitle")}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-marketplace-muted-foreground md:text-sm">
              {t("editorialMakersDescription")}
            </p>
            <Link
              href={`${basePath}/shops`}
              className="mt-3 inline-flex w-fit rounded-md border border-marketplace-brand px-4 py-2 text-xs font-semibold text-marketplace-brand transition hover:bg-marketplace-canvas"
            >
              {t("meetOurSellers")} →
            </Link>
          </div>
        </article>
        <article className="grid min-h-[11rem] overflow-hidden rounded-md bg-marketplace-surface sm:grid-cols-[48%_52%]">
          <div className="flex flex-col justify-center p-5 md:p-6">
            <h3 className="font-display text-2xl font-semibold leading-tight text-marketplace-brand">
              {t("editorialGiftsTitle")}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-marketplace-muted-foreground md:text-sm">
              {t("editorialGiftsDescription")}
            </p>
            <Link
              href={`${basePath}/products?q=gift`}
              className="mt-3 inline-flex w-fit rounded-md border border-marketplace-brand px-4 py-2 text-xs font-semibold text-marketplace-brand transition hover:bg-marketplace-canvas"
            >
              {t("shopGiftGuide")} →
            </Link>
          </div>
          <div className="relative min-h-[10rem]">
            <Image
              src={getEditorialStockImage("gifts")}
              alt=""
              fill
              sizes="(min-width: 640px) 26vw, 100vw"
              className="object-cover"
            />
          </div>
        </article>
      </div>
    </section>
  );
}
