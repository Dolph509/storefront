"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  SettingsAlert,
  SettingsBadge,
  SettingsChoice,
  SettingsSection,
  SettingsStack,
} from "@/components/account/SettingsSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  updateEmailMarketingPreference,
} from "@/lib/data/newsletter";
import { extractBasePath } from "@/lib/utils/path";

export function NotificationSettingsForm() {
  const t = useTranslations("account");
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const { user, refreshUser } = useAuth();
  const [marketing, setMarketing] = useState(!!user?.accepts_email_marketing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="py-8 text-center text-marketplace-muted-foreground">
        {t("loading")}
      </p>
    );
  }

  const currentUser = user;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await updateEmailMarketingPreference(marketing);
      if (!result.success) {
        throw new Error(result.error || t("notificationsSaveFailed"));
      }

      if (marketing && !currentUser.newsletter_subscriber_id) {
        const subscribed = await subscribeNewsletter(currentUser.email);
        if (!subscribed.success) {
          throw new Error(subscribed.error || t("notificationsSaveFailed"));
        }
      }

      if (!marketing && currentUser.newsletter_subscriber_id) {
        const unsubscribed = await unsubscribeNewsletter(
          currentUser.newsletter_subscriber_id,
        );
        if (!unsubscribed.success) {
          throw new Error(unsubscribed.error || t("notificationsSaveFailed"));
        }
      }

      await refreshUser();
      toast.success(t("notificationsSaved"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("notificationsSaveFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void save(event)}>
      <SettingsStack className="space-y-4">
        {error ? <SettingsAlert>{error}</SettingsAlert> : null}

        <SettingsSection
          variant="flat"
          title={t("securityAlertsTitle")}
          description={t("securityAlertsHelp")}
          badge={
            <SettingsBadge tone="danger">
              {t("securityAlertsRecommended")}
            </SettingsBadge>
          }
        >
          <div className="flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-sky-950">
              {t("securityAlertsPhoneHint")}
            </p>
            <Button type="button" className="shrink-0 rounded-full" asChild>
              <Link href={`${basePath}/account/settings/security`}>
                {t("securityAlertsAddPhone")}
              </Link>
            </Button>
          </div>
        </SettingsSection>

        <SettingsSection
          variant="flat"
          title={t("emailSubscriptionsTitle", { email: currentUser.email })}
        >
          <div className="space-y-4">
            <p className="text-sm font-semibold text-marketplace-foreground">
              {t("emailSubscriptionsGeneral")}
            </p>
            <SettingsChoice
              id="email-marketing"
              variant="plain"
              checked={marketing}
              onChange={setMarketing}
              title={t("emailMarketing")}
              description={t("emailMarketingHelp")}
            />
          </div>
        </SettingsSection>

        <div className="pt-1">
          <Button type="submit" className="rounded-full px-6" disabled={saving}>
            {saving ? t("savingPreferences") : t("saveSettings")}
          </Button>
        </div>
      </SettingsStack>
    </form>
  );
}
