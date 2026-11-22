import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { SponsoredDiscoveryRailSection } from "@/components/ads/SponsoredDiscoveryRailSection";
import { MarketplaceHomeSections } from "@/components/home/MarketplaceHomeSections";
import styles from "@/components/home/native-marketplace-home.module.css";
import { resolveCurrency } from "@/lib/data/markets";
import { getMerchandisingPlacements } from "@/lib/data/merchandising";

interface HomeProps {
  basePath: string;
  locale: string;
  country: string;
}

export async function NativeMarketplaceHome(props: HomeProps) {
  const { basePath, locale } = props;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  return (
    <div
      data-native-marketplace-home
      className={`${styles.root} bg-marketplace-background text-marketplace-foreground`}
    >
      <section aria-labelledby="marketplace-intro" className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image
            src="/marketplace/artisan-heart-hero.png"
            fill
            preload
            alt=""
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className={styles.heroCopy}>
          <h1 id="marketplace-intro" className={styles.heroTitle}>
            {t("marketplaceHeroTitle")}
          </h1>
          <p className={styles.heroDescription}>
            {t("marketplaceHeroDescription")}
          </p>
          <div className={styles.heroActions}>
            <Link
              className={styles.heroPrimary}
              href={`${basePath}/products?sort=best_selling`}
            >
              {t("marketplaceHeroPrimaryCta")}{" "}
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link className={styles.heroSecondary} href={`${basePath}/shops`}>
              {t("viewAllShops")} <ArrowUpRight size={15} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
      <Suspense fallback={null}>
        <Discovery {...props} />
      </Suspense>
    </div>
  );
}

async function Discovery(props: HomeProps) {
  const [currency, placements] = await Promise.all([
    resolveCurrency(props.country),
    getMerchandisingPlacements({ surface: "homepage" }),
  ]);
  return (
    <>
      <MarketplaceHomeSections
        {...props}
        currency={currency}
        placements={placements}
      />
      <Suspense fallback={null}>
        <SponsoredDiscoveryRailSection
          placement="homepage_rail"
          titleNamespace="home"
          titleKey="sponsoredPicks"
          basePath={props.basePath}
          locale={props.locale}
          currency={currency}
        />
      </Suspense>
    </>
  );
}
