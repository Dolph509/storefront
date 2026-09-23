import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PromoBarRegionControl } from "@/components/layout/PromoBarRegionControl";

interface MarketplacePromoBarProps {
  basePath: string;
  locale: Locale;
}

export async function MarketplacePromoBar({
  basePath,
  locale,
}: MarketplacePromoBarProps) {
  const t = await getTranslations({ locale, namespace: "header" });

  return (
    <div className="bg-marketplace-promo text-marketplace-promo-foreground">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-sm lg:px-8">
        <p className="font-medium">{t("promoTagline")}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end sm:gap-x-4">
          <span className="hidden text-marketplace-promo-foreground/85 md:inline">
            {t("promoShipping")}
          </span>
          <span className="hidden h-3 w-px bg-marketplace-promo-foreground/30 md:inline" />
          <Link
            href={`${basePath}/policies/terms-of-service`}
            className="hover:underline"
          >
            {t("buyerProtection")}
          </Link>
          <span className="h-3 w-px bg-marketplace-promo-foreground/30" />
          <Link href={`${basePath}/contact`} className="hover:underline">
            {t("help")}
          </Link>
          <span className="h-3 w-px bg-marketplace-promo-foreground/30" />
          <PromoBarRegionControl />
        </div>
      </div>
    </div>
  );
}
