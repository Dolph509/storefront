import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SellApplicationStatus } from "@/components/sell/SellApplicationStatus";
import styles from "@/components/sell/sell-application.module.css";
import {
  getSellerApplicationsEmail,
  getSellerPanelUrl,
  getStoreName,
} from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "sell.status",
  });
  return {
    title: t("metaTitle", { marketplace: getStoreName() }),
    robots: { index: false },
  };
}

export default async function SellApplicationPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "sell.status",
  });

  return (
    <div className={`${styles.page} ${styles.pageNarrow}`}>
      <header className={styles.pageHeader}>
        <Link href={`${basePath}/sell`} className={styles.backLink}>
          <ArrowLeft className="size-4" aria-hidden />
          {t("backToLanding", { marketplace: getStoreName() })}
        </Link>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 className={styles.pageTitle}>{t("title")}</h1>
      </header>
      <SellApplicationStatus
        basePath={basePath}
        applicationsEmail={
          getSellerApplicationsEmail() || "sellers@oddkeeps.com"
        }
        sellerPanelUrl={getSellerPanelUrl()}
      />
    </div>
  );
}
