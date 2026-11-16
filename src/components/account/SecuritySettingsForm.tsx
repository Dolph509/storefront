"use client";

import type {
  AuthProvider,
  CustomerIdentity,
  CustomerSession,
} from "@spree/sdk";
import { Eye, EyeOff, Globe, Link2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  SettingsAlert,
  SettingsBadge,
  SettingsEmpty,
  SettingsList,
  SettingsListItem,
  SettingsSection,
  SettingsStack,
} from "@/components/account/SettingsSection";
import { TwoFactorSetupDialog } from "@/components/account/TwoFactorSetupDialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  confirmPhoneVerification,
  disconnectCustomerIdentity,
  getMfaStatus,
  listAuthProviders,
  listCustomerIdentities,
  listCustomerSessions,
  revokeAllCustomerSessions,
  revokeCustomerSession,
  startPhoneVerification,
  updateCustomer,
} from "@/lib/data/customer";

const PHONE_COUNTRY_CODES = [
  { code: "+1", label: "United States +1" },
  { code: "+44", label: "United Kingdom +44" },
  { code: "+33", label: "France +33" },
  { code: "+49", label: "Germany +49" },
  { code: "+34", label: "Spain +34" },
  { code: "+48", label: "Poland +48" },
  { code: "+61", label: "Australia +61" },
  { code: "+81", label: "Japan +81" },
] as const;

function formatRelativeTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(deltaSeconds);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (abs < 60) return formatter.format(deltaSeconds, "second");
  if (abs < 3600)
    return formatter.format(Math.round(deltaSeconds / 60), "minute");
  if (abs < 86400)
    return formatter.format(Math.round(deltaSeconds / 3600), "hour");
  if (abs < 86400 * 30)
    return formatter.format(Math.round(deltaSeconds / 86400), "day");

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function providerLabel(provider: AuthProvider | CustomerIdentity) {
  if ("label" in provider && provider.label) return provider.label;
  const key = "key" in provider ? provider.key : provider.provider;
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/** Prefer store-facing copy over raw gateway / provider JSON when SMS is absent. */
function friendlyPhoneVerificationError(
  error: string | undefined,
  unavailableMessage: string,
) {
  if (!error) return unavailableMessage;
  const normalized = error.toLowerCase();
  if (
    normalized.includes("sms") ||
    normalized.includes("provider") ||
    normalized.includes("not configured") ||
    normalized.includes("unavailable") ||
    normalized.includes("422") ||
    normalized.includes("{")
  ) {
    return unavailableMessage;
  }
  return error;
}

export function SecuritySettingsForm() {
  const t = useTranslations("profile");
  const ta = useTranslations("account");
  const locale = useLocale();
  const { user, refreshUser, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [identities, setIdentities] = useState<CustomerIdentity[]>([]);
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [sessions, setSessions] = useState<CustomerSession[]>([]);
  const [disconnectPassword, setDisconnectPassword] = useState("");
  const [countryCode, setCountryCode] = useState<string>("+1");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);

  const fullPhone = useMemo(() => {
    const digits = phoneLocal.replace(/\D/g, "");
    return digits ? `${countryCode}${digits}` : "";
  }, [countryCode, phoneLocal]);

  const accountRows = useMemo(() => {
    const byProvider = new Map(
      identities.map((identity) => [identity.provider, identity]),
    );
    const rows = providers.map((provider) => ({
      key: provider.key,
      label: providerLabel(provider),
      authorizationUrl: provider.authorization_url || null,
      identity: byProvider.get(provider.key) || null,
    }));

    for (const identity of identities) {
      if (rows.some((row) => row.key === identity.provider)) continue;
      rows.push({
        key: identity.provider,
        label: providerLabel(identity),
        authorizationUrl: null,
        identity,
      });
    }

    return rows;
  }, [identities, providers]);

  async function reloadSecurity() {
    const [identityResult, sessionResult, providerResult, mfaResult] =
      await Promise.all([
        listCustomerIdentities(),
        listCustomerSessions(),
        listAuthProviders(),
        getMfaStatus(),
      ]);
    if (identityResult.success) setIdentities(identityResult.identities || []);
    if (sessionResult.success) setSessions(sessionResult.sessions || []);
    if (providerResult.success) {
      setProviders(
        (providerResult.providers || []).filter(
          (provider) => provider.kind === "redirect",
        ),
      );
    }
    if (mfaResult.success && mfaResult.status) {
      setMfaEnabled(mfaResult.status.mfa_enabled);
    }
  }

  useEffect(() => {
    void reloadSecurity();
  }, []);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      await refreshUser();
    })();
  }, [user?.id, refreshUser]);

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError(ta("passwordTooShort"));
      return;
    }
    if (password !== passwordConfirmation) {
      setError(ta("passwordsDontMatch"));
      return;
    }
    setSaving(true);
    try {
      const result = await updateCustomer({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      if (!result.success) throw new Error(result.error || t("failedToUpdate"));
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      toast.success(ta("passwordChanged"));
      await reloadSecurity();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("failedToUpdate"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsStack className="space-y-4">
      {error ? <SettingsAlert>{error}</SettingsAlert> : null}

      <SettingsSection
        variant="flat"
        title={ta("phoneVerification")}
        description={ta("phoneVerificationHelp")}
        badge={
          phoneVerified ? (
            <SettingsBadge tone="success">{ta("phoneVerified")}</SettingsBadge>
          ) : (
            <SettingsBadge tone="brand">{ta("phoneNew")}</SettingsBadge>
          )
        }
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)_auto] sm:items-end">
          <Field>
            <FieldLabel htmlFor="security-country-code">
              {ta("phoneCountryCode")}
            </FieldLabel>
            <select
              id="security-country-code"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              className="flex h-9 w-full rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface px-3 text-sm text-marketplace-foreground outline-none focus:border-marketplace-brand"
            >
              {PHONE_COUNTRY_CODES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="security-phone">
              {ta("phoneNumber")}
            </FieldLabel>
            <Input
              id="security-phone"
              type="tel"
              inputMode="tel"
              value={phoneLocal}
              onChange={(event) => {
                setPhoneLocal(event.target.value);
                setCodeSent(false);
              }}
              placeholder="5551234567"
            />
          </Field>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={!fullPhone}
            onClick={async () => {
              const result = await startPhoneVerification(fullPhone);
              if (!result.success) {
                toast.error(
                  friendlyPhoneVerificationError(
                    result.error,
                    ta("phoneVerificationUnavailable"),
                  ),
                );
                return;
              }
              setCodeSent(true);
              toast.success(ta("sendVerificationCode"));
            }}
          >
            {ta("sendVerificationCode")}
          </Button>
        </div>

        {codeSent ? (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Field>
              <FieldLabel htmlFor="security-phone-code">
                {ta("verificationCode")}
              </FieldLabel>
              <Input
                id="security-phone-code"
                value={phoneCode}
                onChange={(event) => setPhoneCode(event.target.value)}
              />
            </Field>
            <Button
              type="button"
              className="rounded-full"
              disabled={!phoneCode}
              onClick={async () => {
                const result = await confirmPhoneVerification(
                  fullPhone,
                  phoneCode,
                );
                if (!result.success) {
                  toast.error(
                    friendlyPhoneVerificationError(
                      result.error,
                      ta("phoneVerificationUnavailable"),
                    ),
                  );
                  return;
                }
                setPhoneVerified(true);
                toast.success(ta("phoneVerified"));
              }}
            >
              {ta("confirmCode")}
            </Button>
          </div>
        ) : null}

        <div className="flex items-start gap-2.5 rounded-[var(--marketplace-radius-sm)] border border-sky-200 bg-sky-50 px-3.5 py-3 text-sm text-sky-900">
          <Globe className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{ta("phoneVerificationNotice")}</p>
        </div>
      </SettingsSection>

      <SettingsSection
        variant="flat"
        title={
          <>
            {ta("twoFactor")}.{" "}
            <span className="font-semibold text-marketplace-muted-foreground">
              {mfaEnabled ? ta("twoFactorOn") : ta("twoFactorOff")}
            </span>
          </>
        }
        description={ta("twoFactorHelp")}
        badge={
          mfaEnabled ? null : (
            <SettingsBadge tone="danger">
              {ta("twoFactorRecommended")}
            </SettingsBadge>
          )
        }
        action={
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => setMfaDialogOpen(true)}
          >
            {mfaEnabled ? ta("disableTwoFactor") : ta("enableTwoFactor")}
          </Button>
        }
      />

      <TwoFactorSetupDialog
        open={mfaDialogOpen}
        onOpenChange={setMfaDialogOpen}
        enabled={mfaEnabled}
        onEnabledChange={(nextEnabled) => setMfaEnabled(nextEnabled)}
      />

      <SettingsSection
        variant="flat"
        title={ta("connectedAccounts")}
        description={ta("connectedAccountsHelp")}
      >
        {accountRows.length === 0 ? (
          <SettingsEmpty>{ta("noRedirectProviders")}</SettingsEmpty>
        ) : (
          <>
            <SettingsList>
              {accountRows.map((row) => (
                <SettingsListItem
                  key={row.key}
                  icon={<Link2 className="size-4" aria-hidden="true" />}
                  title={
                    row.identity
                      ? ta("accountConnected", { provider: row.label })
                      : ta("accountConnect", { provider: row.label })
                  }
                  description={
                    row.identity ? (
                      <span className="font-mono text-xs">
                        {row.identity.uid}
                      </span>
                    ) : null
                  }
                  action={
                    row.identity ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={async () => {
                          const result = await disconnectCustomerIdentity(
                            row.identity!.id,
                            disconnectPassword || undefined,
                          );
                          if (!result.success) {
                            toast.error(
                              result.error || ta("disconnectAccount"),
                            );
                            return;
                          }
                          toast.success(ta("disconnectAccount"));
                          await reloadSecurity();
                        }}
                      >
                        {ta("disconnectAccount")}
                      </Button>
                    ) : row.authorizationUrl ? (
                      <a
                        href={row.authorizationUrl}
                        className="inline-flex h-8 items-center rounded-full border border-marketplace-border-subtle px-3.5 text-sm font-medium text-marketplace-foreground transition-colors hover:bg-marketplace-surface-warm"
                      >
                        {ta("connectAccount")}
                      </a>
                    ) : null
                  }
                />
              ))}
            </SettingsList>
            {identities.length > 0 ? (
              <Field>
                <FieldLabel htmlFor="disconnect-password">
                  {t("currentPassword")}
                </FieldLabel>
                <Input
                  id="disconnect-password"
                  type="password"
                  autoComplete="current-password"
                  value={disconnectPassword}
                  onChange={(event) =>
                    setDisconnectPassword(event.target.value)
                  }
                />
              </Field>
            ) : null}
          </>
        )}
      </SettingsSection>

      <SettingsSection
        variant="flat"
        title={ta("signInActivity")}
        description={ta("signInActivityHelp")}
        action={
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={async () => {
              const result = await revokeAllCustomerSessions();
              if (!result.success) {
                toast.error(result.error || ta("signOutEverywhere"));
                return;
              }
              await logout();
            }}
          >
            {ta("signOutEverywhere")}
          </Button>
        }
      >
        {sessions.length === 0 ? (
          <SettingsEmpty>{ta("unknownDevice")}</SettingsEmpty>
        ) : (
          <div className="overflow-x-auto rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-marketplace-border-subtle bg-marketplace-surface-warm/40 text-xs font-semibold uppercase tracking-wide text-marketplace-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {ta("sessionTime")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {ta("sessionDevice")}
                  </th>
                  <th className="px-4 py-3 font-semibold">{ta("sessionIp")}</th>
                  <th className="px-4 py-3 font-semibold">
                    {ta("sessionStatus")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marketplace-border-subtle">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-marketplace-foreground">
                      {formatRelativeTime(session.created_at, locale)}
                    </td>
                    <td className="px-4 py-3 text-marketplace-foreground">
                      {session.user_agent || ta("unknownDevice")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-sky-700">
                      {session.ip_address || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {session.current ? (
                        <span className="font-medium text-marketplace-foreground">
                          {ta("currentSession")}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="font-semibold text-marketplace-foreground underline-offset-2 hover:underline"
                          onClick={async () => {
                            const result = await revokeCustomerSession(
                              session.id,
                            );
                            if (!result.success) {
                              toast.error(result.error || ta("signOutSession"));
                              return;
                            }
                            await reloadSecurity();
                          }}
                        >
                          {ta("signOutSession")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsSection>

      <form onSubmit={(event) => void submitPassword(event)}>
        <SettingsSection
          variant="flat"
          title={ta("settingsPassword")}
          description={ta("settingsPasswordHelp")}
          footer={
            <div className="flex justify-end">
              <Button type="submit" className="rounded-full" disabled={saving}>
                {saving ? t("saving") : ta("changePassword")}
              </Button>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="security-current-password">
                {t("currentPassword")}
              </FieldLabel>
              <div className="relative">
                <Input
                  id="security-current-password"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label={
                    showCurrent ? ta("hidePassword") : ta("showPassword")
                  }
                >
                  {showCurrent ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="security-new-password">
                {ta("newPassword")}
              </FieldLabel>
              <div className="relative">
                <Input
                  id="security-new-password"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
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
                  onClick={() => setShowNew(!showNew)}
                  aria-label={showNew ? ta("hidePassword") : ta("showPassword")}
                >
                  {showNew ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="security-confirm-password">
                {ta("confirmNewPassword")}
              </FieldLabel>
              <Input
                id="security-confirm-password"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                required
                value={passwordConfirmation}
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
              />
            </Field>
          </div>
        </SettingsSection>
      </form>
    </SettingsStack>
  );
}
