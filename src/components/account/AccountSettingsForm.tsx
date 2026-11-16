"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  SettingsAlert,
  SettingsBadge,
  SettingsSection,
  SettingsStack,
} from "@/components/account/SettingsSection";
import { RegionPreferences } from "@/components/layout/RegionPreferences";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { updateCustomer } from "@/lib/data/customer";
import { extractBasePath } from "@/lib/utils/path";

function formatMemberSince(value: string | null | undefined, locale: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function AccountSettingsForm() {
  const t = useTranslations("profile");
  const ta = useTranslations("account");
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const locale = pathname.split("/")[2] || "en";
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberSince = useMemo(
    () => formatMemberSince(user?.member_since, locale),
    [user?.member_since, locale],
  );

  if (!user) {
    return (
      <p className="py-8 text-center text-marketplace-muted-foreground">
        {t("loadingProfile")}
      </p>
    );
  }

  const emailChanged = email.trim() !== user.email;

  async function saveName(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSavingProfile(true);
    try {
      const result = await updateCustomer({
        first_name: firstName,
        last_name: lastName,
      });
      if (!result.success) throw new Error(result.error || t("failedToUpdate"));
      await refreshUser();
      toast.success(t("profileUpdated"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("failedToUpdate"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveEmail(event: React.FormEvent) {
    event.preventDefault();
    if (!emailChanged) return;
    setError(null);
    setSavingEmail(true);
    try {
      const result = await updateCustomer({
        email: email.trim(),
        current_password: password,
      });
      if (!result.success) throw new Error(result.error || t("failedToUpdate"));
      await refreshUser();
      setPassword("");
      toast.success(t("profileUpdated"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("failedToUpdate"));
    } finally {
      setSavingEmail(false);
    }
  }

  return (
    <SettingsStack>
      {error ? <SettingsAlert>{error}</SettingsAlert> : null}

      <SettingsSection
        title={ta("settingsAboutYou")}
        description={ta("settingsAboutYouHelp")}
        badge={
          memberSince ? (
            <SettingsBadge tone="brand">
              {ta("memberSince", { date: memberSince })}
            </SettingsBadge>
          ) : null
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`${basePath}/account/settings/public-profile`}
              className="text-sm font-medium text-marketplace-brand transition-colors hover:text-marketplace-foreground"
            >
              {t("viewPublicProfile")}
            </Link>
            <Button
              type="submit"
              form="settings-about-you"
              disabled={savingProfile}
            >
              {savingProfile ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        }
      >
        <form id="settings-about-you" onSubmit={saveName} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="settings-first-name">
                {t("firstName")}
              </FieldLabel>
              <Input
                id="settings-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-last-name">
                {t("lastName")}
              </FieldLabel>
              <Input
                id="settings-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </Field>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection
        title={ta("settingsLocation")}
        description={ta("settingsLocationHelp")}
      >
        <div className="rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface-warm/30 p-4 sm:p-5">
          <RegionPreferences
            variant="menu"
            showCountryOverride
            showLanguageOverride
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("emailAddress")}
        description={ta("settingsEmailHelp")}
        footer={
          <div className="flex justify-end">
            <Button
              type="submit"
              form="settings-email"
              disabled={savingEmail || !emailChanged}
            >
              {savingEmail ? t("saving") : ta("changeEmail")}
            </Button>
          </div>
        }
      >
        <form id="settings-email" onSubmit={saveEmail} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="settings-current-email">
              {ta("currentEmail")}
            </FieldLabel>
            <Input
              id="settings-current-email"
              value={user.email}
              readOnly
              disabled
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-new-email">
              {ta("newEmail")}
            </FieldLabel>
            <Input
              id="settings-new-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          {emailChanged ? (
            <Field>
              <FieldLabel htmlFor="settings-email-password">
                {t("currentPassword")}
              </FieldLabel>
              <div className="relative">
                <Input
                  id="settings-email-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? ta("hidePassword") : ta("showPassword")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-marketplace-muted-foreground">
                {t("currentPasswordHelp")}
              </p>
            </Field>
          ) : null}
        </form>
      </SettingsSection>
    </SettingsStack>
  );
}
