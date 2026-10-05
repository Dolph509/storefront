"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AccountUnderlineTabs } from "@/components/account/AccountUnderlineTabs";
import { extractBasePath } from "@/lib/utils/path";

const SETTINGS_TABS = [
  { slug: "account", labelKey: "settingsTabAccount" as const },
  { slug: "security", labelKey: "settingsTabSecurity" as const },
  { slug: "public-profile", labelKey: "settingsTabPublicProfile" as const },
  { slug: "privacy", labelKey: "settingsTabPrivacy" as const },
  { slug: "addresses", labelKey: "settingsTabAddresses" as const },
  { slug: "credit-cards", labelKey: "settingsTabCreditCards" as const },
  { slug: "notifications", labelKey: "settingsTabNotifications" as const },
];

export function SettingsTabs() {
  const t = useTranslations("account");
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);

  const settingsRoot = `${basePath}/account/settings`;

  return (
    <AccountUnderlineTabs
      aria-label={t("accountSettings")}
      tabs={SETTINGS_TABS.map((tab) => {
        const href = `${settingsRoot}/${tab.slug}`;
        const isAccountDefault =
          tab.slug === "account" &&
          (pathname === settingsRoot || pathname === `${settingsRoot}/`);
        return {
          href,
          label: t(tab.labelKey),
          isActive:
            isAccountDefault ||
            pathname === href ||
            pathname.startsWith(`${href}/`),
        };
      })}
    />
  );
}
