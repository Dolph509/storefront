"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { SettingsAlert } from "@/components/account/SettingsSection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  confirmMfaTotp,
  disableMfaTotp,
  setupMfaTotp,
} from "@/lib/data/customer";
import { cn } from "@/lib/utils";

type Method = "authenticator" | "sms" | "phone_call";
type Step = "method" | "setup" | "recovery" | "disable";

function MethodOption({
  id,
  label,
  selected,
  onSelect,
  badge,
  disabled,
}: {
  id: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center gap-3 py-2.5",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-marketplace-foreground"
            : "border-marketplace-border",
          disabled && "border-marketplace-border-subtle",
        )}
        aria-hidden="true"
      >
        {selected ? (
          <span className="size-2.5 rounded-full bg-marketplace-foreground" />
        ) : null}
      </span>
      <input
        id={id}
        type="radio"
        name="mfa-method"
        className="sr-only"
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
      />
      <span className="text-[15px] font-medium text-marketplace-foreground">
        {label}
      </span>
      {badge ? (
        <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </label>
  );
}

function ModalShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <>
      <DialogHeader className="space-y-2 px-6 pt-6 pr-14 text-left sm:px-7 sm:pt-7">
        <DialogTitle className="text-xl font-semibold tracking-tight text-marketplace-foreground sm:text-[1.35rem]">
          {title}
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-marketplace-muted-foreground">
          {description}
        </DialogDescription>
      </DialogHeader>
      <div className="px-6 py-5 sm:px-7">{children}</div>
      <div className="flex items-center justify-between gap-3 border-t border-marketplace-border-subtle px-6 py-4 sm:px-7">
        {footer}
      </div>
    </>
  );
}

export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  enabled,
  onEnabledChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean, recoveryCodes?: string[] | null) => void;
}) {
  const t = useTranslations("profile");
  const ta = useTranslations("account");
  const [step, setStep] = useState<Step>(enabled ? "disable" : "method");
  const [method, setMethod] = useState<Method>("authenticator");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(enabled ? "disable" : "method");
    setMethod("authenticator");
    setPassword("");
    setCode("");
    setOtpauthUri(null);
    setRecoveryCodes(null);
    setBusy(false);
    setError(null);
  }, [open, enabled]);

  function close() {
    onOpenChange(false);
  }

  function continueFromMethod() {
    if (method !== "authenticator") {
      setError(ta("twoFactorMethodUnavailable"));
      return;
    }
    setError(null);
    setStep("setup");
  }

  async function startSetup() {
    setError(null);
    setBusy(true);
    try {
      const result = await setupMfaTotp(password);
      if (!result.success) {
        throw new Error(result.error || ta("enableTwoFactor"));
      }
      if (!result.setup) {
        throw new Error(ta("enableTwoFactor"));
      }
      setOtpauthUri(result.setup.otpauth_uri);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : ta("enableTwoFactor"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmSetup() {
    setError(null);
    setBusy(true);
    try {
      const result = await confirmMfaTotp(password, code);
      if (!result.success) {
        throw new Error(result.error || ta("enableTwoFactor"));
      }
      const codes = result.recovery_codes || null;
      setRecoveryCodes(codes);
      onEnabledChange(true, codes);
      setStep("recovery");
      toast.success(ta("twoFactorOn"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : ta("enableTwoFactor"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmDisable() {
    setError(null);
    setBusy(true);
    try {
      const result = await disableMfaTotp(password, code);
      if (!result.success) {
        throw new Error(result.error || ta("disableTwoFactor"));
      }
      onEnabledChange(false, null);
      toast.success(ta("twoFactorOff"));
      close();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : ta("disableTwoFactor"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-2xl border-0 bg-marketplace-surface p-0 text-marketplace-foreground shadow-xl ring-1 ring-black/10 sm:max-w-[28rem]"
      >
        <DialogClose asChild>
          <button
            type="button"
            className="absolute top-3.5 right-3.5 z-10 flex size-8 items-center justify-center rounded-full border border-marketplace-border-subtle bg-marketplace-surface text-marketplace-foreground transition-colors hover:bg-marketplace-surface-warm"
            aria-label={ta("cancel")}
          >
            <XIcon className="size-4" />
          </button>
        </DialogClose>

        {step === "method" ? (
          <ModalShell
            title={ta("twoFactorDialogTitle")}
            description={ta("twoFactorDialogHelp")}
            footer={
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-5"
                  onClick={close}
                >
                  {ta("cancel")}
                </Button>
                <Button
                  type="button"
                  className="rounded-full px-5"
                  onClick={continueFromMethod}
                >
                  {ta("continue")}
                </Button>
              </>
            }
          >
            <div className="space-y-3">
              <p className="text-sm font-semibold text-marketplace-foreground">
                {ta("twoFactorDialogQuestion")}
              </p>
              {error ? <SettingsAlert>{error}</SettingsAlert> : null}
              <div className="space-y-0.5">
                <MethodOption
                  id="mfa-method-authenticator"
                  label={ta("twoFactorMethodAuthenticator")}
                  selected={method === "authenticator"}
                  onSelect={() => {
                    setMethod("authenticator");
                    setError(null);
                  }}
                  badge={ta("twoFactorMostSecure")}
                />
                <MethodOption
                  id="mfa-method-sms"
                  label={`${ta("twoFactorMethodSms")} (${ta("twoFactorMethodUnavailableShort")})`}
                  selected={method === "sms"}
                  onSelect={() => {
                    setMethod("sms");
                    setError(null);
                  }}
                  disabled
                />
                <MethodOption
                  id="mfa-method-call"
                  label={`${ta("twoFactorMethodPhoneCall")} (${ta("twoFactorMethodUnavailableShort")})`}
                  selected={method === "phone_call"}
                  onSelect={() => {
                    setMethod("phone_call");
                    setError(null);
                  }}
                  disabled
                />
              </div>
              <p className="text-xs leading-5 text-marketplace-muted-foreground">
                {ta("twoFactorMethodUnavailable")}
              </p>
            </div>
          </ModalShell>
        ) : null}

        {step === "setup" ? (
          <ModalShell
            title={ta("twoFactorMethodAuthenticator")}
            description={ta("twoFactorSetupHelp")}
            footer={
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-5"
                  onClick={() => {
                    setStep("method");
                    setError(null);
                  }}
                >
                  {ta("cancel")}
                </Button>
                <Button
                  type="button"
                  className="rounded-full px-5"
                  disabled={busy || !otpauthUri || !code}
                  onClick={() => void confirmSetup()}
                >
                  {busy ? t("saving") : ta("confirmCode")}
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              {error ? <SettingsAlert>{error}</SettingsAlert> : null}
              <Field>
                <FieldLabel htmlFor="mfa-dialog-password">
                  {t("currentPassword")}
                </FieldLabel>
                <Input
                  id="mfa-dialog-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
              {!otpauthUri ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={busy || !password}
                  onClick={() => void startSetup()}
                >
                  {busy ? t("saving") : ta("twoFactorGenerateSecret")}
                </Button>
              ) : (
                <>
                  <div className="rounded-xl border border-dashed border-marketplace-border-subtle bg-marketplace-surface-warm/40 px-4 py-3">
                    <p className="break-all font-mono text-xs text-marketplace-muted-foreground">
                      {otpauthUri}
                    </p>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="mfa-dialog-code">
                      {ta("authenticatorCode")}
                    </FieldLabel>
                    <Input
                      id="mfa-dialog-code"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                    />
                  </Field>
                </>
              )}
            </div>
          </ModalShell>
        ) : null}

        {step === "recovery" ? (
          <ModalShell
            title={ta("recoveryCodes")}
            description={ta("recoveryCodesHelp")}
            footer={
              <>
                <span />
                <Button
                  type="button"
                  className="rounded-full px-5"
                  onClick={close}
                >
                  {ta("done")}
                </Button>
              </>
            }
          >
            <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
              {(recoveryCodes || []).map((recoveryCode) => (
                <li
                  key={recoveryCode}
                  className="rounded-lg bg-marketplace-surface-warm/50 px-3 py-2 text-center"
                >
                  {recoveryCode}
                </li>
              ))}
            </ul>
          </ModalShell>
        ) : null}

        {step === "disable" ? (
          <ModalShell
            title={ta("disableTwoFactor")}
            description={ta("twoFactorDisableHelp")}
            footer={
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-5"
                  onClick={close}
                >
                  {ta("cancel")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-full px-5"
                  disabled={busy || !password || !code}
                  onClick={() => void confirmDisable()}
                >
                  {busy ? t("saving") : ta("disableTwoFactor")}
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              {error ? <SettingsAlert>{error}</SettingsAlert> : null}
              <Field>
                <FieldLabel htmlFor="mfa-disable-password">
                  {t("currentPassword")}
                </FieldLabel>
                <Input
                  id="mfa-disable-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="mfa-disable-code">
                  {ta("authenticatorCode")}
                </FieldLabel>
                <Input
                  id="mfa-disable-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </Field>
            </div>
          </ModalShell>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
