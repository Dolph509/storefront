import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getEditorialStockImage } from "@/lib/marketplace-stock-images";

interface LocalMakersCtaProps {
  basePath: string;
  locale: string;
}

export async function LocalMakersCta({
  basePath,
  locale,
}: LocalMakersCtaProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "shops",
  });

  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-[#e8e2d8] bg-[#f2ece4]">
      <div className="grid items-stretch gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="flex max-w-xl flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <h2 className="font-display text-[clamp(1.85rem,1.45rem+1.4vw,2.75rem)] font-normal leading-[1.1] tracking-[-0.03em] text-marketplace-foreground">
            {t("makersCtaTitle")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-marketplace-muted-foreground sm:text-[0.975rem]">
            {t("makersCtaBody")}
          </p>
          <Link
            href={`${basePath}/shops`}
            className="mt-7 inline-flex h-11 w-fit items-center rounded-full bg-marketplace-brand px-5 text-sm font-semibold text-marketplace-brand-foreground transition-colors hover:bg-marketplace-brand-accent-hover"
          >
            {t("makersCtaButton")}
          </Link>
        </div>
        <div className="relative min-h-[16rem] sm:min-h-[18rem] lg:min-h-full">
          <Image
            src={getEditorialStockImage("makers")}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
