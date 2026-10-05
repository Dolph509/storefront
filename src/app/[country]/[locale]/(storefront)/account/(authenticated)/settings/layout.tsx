import { getTranslations } from "next-intl/server";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { SettingsTabs } from "@/components/account/SettingsTabs";

export default async function AccountSettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "account",
  });

  return (
    <div className="min-w-0 max-w-full">
      <AccountPageHeader title={t("accountSettings")} />
      <SettingsTabs />
      <div className="min-w-0 pt-1">{children}</div>
    </div>
  );
}
