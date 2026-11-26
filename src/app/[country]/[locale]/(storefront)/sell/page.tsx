import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EDITABLE_STATUSES } from "@/components/sell/application-status";
import { SellLanding } from "@/components/sell/SellLanding";
import {
  hasSellerDashboardAccess,
  listSellerApplications,
} from "@/lib/data/seller-applications";
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
    namespace: "sell.landing",
  });
  return {
    title: t("metaTitle", { marketplace: getStoreName() }),
    description: t("metaDescription", { marketplace: getStoreName() }),
  };
}

export default async function SellPage({
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
  if (applications.length) redirect(`${basePath}/sell/apply`);

  return (
    <SellLanding
      basePath={basePath}
      storeName={getStoreName()}
      applicationsEmail={getSellerApplicationsEmail() || "sellers@oddkeeps.com"}
    />
  );
}
