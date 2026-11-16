"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  SettingsAlert,
  SettingsSection,
  SettingsStack,
} from "@/components/account/SettingsSection";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type User, useAuth } from "@/contexts/AuthContext";
import { updateCustomer, uploadProfileAvatar } from "@/lib/data/customer";

function PublicProfileForm({
  user,
  refreshUser,
}: {
  user: User;
  refreshUser: () => Promise<void>;
}) {
  const t = useTranslations("profile");
  const [form, setForm] = useState({
    bio: user.bio || "",
    other_accounts: user.other_accounts || "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photoTips = (() => {
    try {
      const value = t.raw("photoTips");
      return Array.isArray(value)
        ? value.filter((tip): tip is string => typeof tip === "string")
        : [];
    } catch {
      return [];
    }
  })();

  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const choosePhoto = async (file?: File) => {
    if (!file) return;
    setPhotoError(null);
    if (
      file.size >= 10 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/gif"].includes(file.type)
    ) {
      setPhotoError(t("invalidPhoto"));
      return;
    }
    const image = new window.Image();
    const url = URL.createObjectURL(file);
    try {
      image.src = url;
      await image.decode();
      if (
        image.naturalWidth < 400 ||
        image.naturalWidth !== image.naturalHeight
      ) {
        setPhotoError(t("invalidPhoto"));
        return;
      }
      setPhoto(file);
    } catch {
      setPhotoError(t("invalidPhoto"));
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (photoError) return;
    setError(null);
    setSaving(true);
    try {
      let avatar: string | undefined;
      if (photo) {
        const data = new FormData();
        data.set("file", photo);
        avatar = await uploadProfileAvatar(data);
      }
      const result = await updateCustomer({
        ...(avatar ? { avatar } : {}),
        public_profile: {
          bio: form.bio.trim(),
          other_accounts: form.other_accounts.trim(),
        },
      });
      if (!result.success) throw new Error(result.error || t("failedToUpdate"));
      await refreshUser();
      setPhoto(null);
      setPreview(null);
      toast.success(t("profileUpdated"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("failedToUpdate"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)}>
      <SettingsStack>
        {error ? <SettingsAlert>{error}</SettingsAlert> : null}

        <SettingsSection
          title={t("bioAndPhoto")}
          description={t("bioAndPhotoHelp")}
          footer={
            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !!photoError}>
                {saving ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          }
        >
          <div className="rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface-warm/30 p-4 sm:p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-marketplace-surface text-2xl font-semibold text-marketplace-brand ring-1 ring-inset ring-marketplace-border-subtle shadow-sm">
                {preview || user.avatar_url ? (
                  <Image
                    src={preview || user.avatar_url || ""}
                    alt={t("profilePhoto")}
                    width={112}
                    height={112}
                    unoptimized
                    className="size-full object-cover"
                  />
                ) : (
                  (user.first_name?.[0] || user.email[0] || "?").toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-marketplace-foreground">
                    {t("profilePhoto")}
                  </h3>
                  <p className="mt-1 text-sm text-marketplace-muted-foreground">
                    {t("profilePhotoHelp")}
                  </p>
                </div>
                <label
                  htmlFor="settings-profile-photo"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface px-3.5 py-2 text-sm font-medium transition-colors duration-200 hover:bg-marketplace-surface-warm focus-within:ring-2 focus-within:ring-marketplace-brand"
                >
                  <Camera className="size-4" aria-hidden="true" />
                  {preview || user.avatar_url
                    ? t("replacePhoto")
                    : t("choosePhoto")}
                </label>
                <input
                  id="settings-profile-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="sr-only"
                  onChange={(event) =>
                    void choosePhoto(event.target.files?.[0])
                  }
                />
                {photoTips.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-marketplace-muted-foreground">
                    {photoTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-marketplace-muted-foreground">
                    {t("photoRequirements")}
                  </p>
                )}
                {photoError ? (
                  <SettingsAlert>{photoError}</SettingsAlert>
                ) : null}
              </div>
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="settings-bio">{t("aboutYou")}</FieldLabel>
            <textarea
              id="settings-bio"
              rows={6}
              maxLength={1000}
              value={form.bio}
              onChange={(event) =>
                setForm({ ...form, bio: event.target.value })
              }
              placeholder={t("aboutYouPlaceholder")}
              className="w-full rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface px-3 py-2.5 text-sm text-marketplace-foreground outline-none transition-colors focus:border-marketplace-brand"
            />
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="max-w-2xl text-xs leading-5 text-marketplace-muted-foreground">
                {t("aboutYouHelp")}
              </p>
              <p className="text-xs tabular-nums text-marketplace-muted-foreground">
                {form.bio.length}/1000
              </p>
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="settings-other-accounts">
              {t("otherAccounts")}
            </FieldLabel>
            <Input
              id="settings-other-accounts"
              maxLength={500}
              value={form.other_accounts}
              onChange={(event) =>
                setForm({ ...form, other_accounts: event.target.value })
              }
              placeholder={t("otherAccountsPlaceholder")}
            />
            <p className="text-xs leading-5 text-marketplace-muted-foreground">
              {t("otherAccountsHelp")}
            </p>
          </Field>
        </SettingsSection>
      </SettingsStack>
    </form>
  );
}

export function PublicProfileSettingsForm() {
  const t = useTranslations("profile");
  const { user, refreshUser } = useAuth();
  if (!user) {
    return (
      <p className="py-8 text-center text-marketplace-muted-foreground">
        {t("loadingProfile")}
      </p>
    );
  }
  return (
    <PublicProfileForm key={user.id} user={user} refreshUser={refreshUser} />
  );
}
