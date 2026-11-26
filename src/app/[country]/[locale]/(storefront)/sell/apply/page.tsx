import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { EDITABLE_STATUSES } from "@/components/sell/application-status";
import { SellApplicationWizard } from "@/components/sell/SellApplicationWizard";
import styles from "@/components/sell/sell-application.module.css";
import {
  hasSellerDashboardAccess,
  listSellerApplications,
} from "@/lib/data/seller-applications";
import { getSellerPanelUrl, getStoreName } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "sell.apply",
  });
  return {
    title: t("metaTitle", { marketplace: getStoreName() }),
    robots: { index: false },
  };
}

export default async function SellApplyPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  if (await hasSellerDashboardAccess()) {
    redirect(getSellerPanelUrl() || `${basePath}/account`);
  }
  const applications = await listSellerApplications();
  if (applications.some((item) => !EDITABLE_STATUSES.includes(item.status))) {
    redirect(`${basePath}/sell/application`);
  }
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "sell.apply",
  });

  return (
    <div className={`${styles.page} ${styles.applyPage}`}>
      <header className={styles.applyHeader}>
        <Link href={`${basePath}/sell`} className={styles.backLink}>
          <ArrowLeft className="size-4" aria-hidden />
          {t("backToLanding", { marketplace: getStoreName() })}
        </Link>

        <h1 className={styles.pageTitle}>{t("title")}</h1>
        <p className={styles.pageIntro}>{t("intro")}</p>
      </header>
      <Suspense fallback={null}>
        <SellApplicationWizard basePath={basePath} />
      </Suspense>
    </div>
  );
}
