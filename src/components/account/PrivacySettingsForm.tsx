"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  SettingsAlert,
  SettingsChoice,
  SettingsEmpty,
  SettingsList,
  SettingsListItem,
  SettingsSection,
  SettingsStack,
} from "@/components/account/SettingsSection";
import { RECENTLY_VIEWED_STORAGE_KEY } from "@/components/products/RecentlyViewedProducts";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  listCommunicationBlocks,
  unblockSeller,
} from "@/lib/data/communication-blocks";
import { updateCustomer } from "@/lib/data/customer";
import { createDataRequest } from "@/lib/data/data-requests";
import { extractBasePath } from "@/lib/utils/path";

type BlockRow = {
  id: string;
  seller_id?: string | null;
  seller_name?: string | null;
  seller_slug?: string | null;
};

export function PrivacySettingsForm() {
  const t = useTranslations("account");
  const tm = useTranslations("messages");
  const pathname = usePathname();
  const router = useRouter();
  const basePath = extractBasePath(pathname);
  const { logout, user, refreshUser } = useAuth();
  const [personalizationEnabled, setPersonalizationEnabled] = useState(
    user?.personalization_enabled ?? true,
  );
  const [savingPersonalization, setSavingPersonalization] = useState(false);
  const [rows, setRows] = useState<BlockRow[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    void listCommunicationBlocks()
      .then((page) => {
        if (active) {
          setRows(Array.isArray(page?.data) ? (page.data as BlockRow[]) : []);
        }
      })
      .catch(() => {
        if (active) setRows([]);
      })
      .finally(() => {
        if (active) setLoadingBlocks(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function clearRecentlyViewed() {
    try {
      window.localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
      toast.success(t("recentlyViewedCleared"));
    } catch {
      toast.error(t("recentlyViewedClearFailed"));
    }
  }

  async function requestExport() {
    setError(null);
    setExporting(true);
    try {
      const result = await createDataRequest({ kind: "access" });
      if (!result.success)
        throw new Error(result.error || t("dataExportFailed"));
      toast.success(t("dataExportRequested"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("dataExportFailed"),
      );
    } finally {
      setExporting(false);
    }
  }

  async function closeAccount(event: React.FormEvent) {
    event.preventDefault();
    if (!confirmed) return;
    setError(null);
    setClosing(true);
    try {
      const result = await createDataRequest({
        kind: "erasure",
        current_password: password,
      });
      if (!result.success)
        throw new Error(result.error || t("closeAccountFailed"));
      await logout();
      router.replace(basePath || "/");
      toast.success(t("closeAccountRequested"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("closeAccountFailed"),
      );
    } finally {
      setClosing(false);
    }
  }

  function handleUnblock(blockId: string) {
    startTransition(async () => {
      try {
        await unblockSeller(blockId);
        setRows((current) => current.filter((row) => row.id !== blockId));
        router.refresh();
      } catch {
        // silent retry
      }
    });
  }

  async function savePersonalization(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSavingPersonalization(true);
    try {
      const result = await updateCustomer({
        personalization_enabled: personalizationEnabled,
      });
      if (!result.success) {
        throw new Error(result.error || t("personalizationSaveFailed"));
      }
      await refreshUser();
      toast.success(t("personalizationSaved"));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t("personalizationSaveFailed"),
      );
    } finally {
      setSavingPersonalization(false);
    }
  }

  return (
    <SettingsStack className="space-y-4">
      {error && !closeOpen ? <SettingsAlert>{error}</SettingsAlert> : null}

      <form onSubmit={(event) => void savePersonalization(event)}>
        <SettingsSection
          variant="flat"
          title={t("personalizedRecommendationsTitle")}
          description={t("personalizedRecommendationsHelp")}
          footer={
            <Button
              type="submit"
              variant="outline"
              className="rounded-full"
              disabled={savingPersonalization}
            >
              {savingPersonalization
                ? t("savingPreferences")
                : t("saveSettings")}
            </Button>
          }
        >
          <SettingsChoice
            id="personalized-recommendations"
            variant="plain"
            checked={personalizationEnabled}
            onChange={setPersonalizationEnabled}
            title={t("personalizedRecommendationsTitle")}
            description={t("personalizedRecommendationsHelp")}
          />
        </SettingsSection>
      </form>

      <SettingsSection
        variant="flat"
        title={t("recentlyViewedTitle")}
        description={t("recentlyViewedHelp")}
        footer={
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={clearRecentlyViewed}
          >
            {t("clearRecentlyViewed")}
          </Button>
        }
      />

      <SettingsSection
        variant="flat"
        title={t("downloadYourData")}
        description={t("downloadYourDataBody")}
        footer={
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => void requestExport()}
            disabled={exporting}
          >
            {exporting ? t("requestingDataExport") : t("requestDataExport")}
          </Button>
        }
      />

      <SettingsSection
        variant="flat"
        title={t("closeYourAccount")}
        description={t("closeYourAccountHelp")}
        footer={
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setError(null);
              setPassword("");
              setConfirmed(false);
              setCloseOpen(true);
            }}
          >
            {t("requestAccountDeletion")}
          </Button>
        }
      />

      <SettingsSection
        variant="flat"
        title={t("blockedShopsTitle")}
        description={t("blockedShopsDescription")}
      >
        {loadingBlocks ? (
          <p className="text-sm text-marketplace-muted-foreground">
            {t("loading")}
          </p>
        ) : rows.length === 0 ? (
          <SettingsEmpty>{t("blockedShopsEmpty")}</SettingsEmpty>
        ) : (
          <SettingsList>
            {rows.map((row) => (
              <SettingsListItem
                key={row.id}
                title={
                  row.seller_slug ? (
                    <Link
                      href={`${basePath}/sellers/${row.seller_slug}`}
                      className="hover:underline"
                    >
                      {row.seller_name || t("blockedShopUnknown")}
                    </Link>
                  ) : (
                    row.seller_name || t("blockedShopUnknown")
                  )
                }
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={pending}
                    onClick={() => handleUnblock(row.id)}
                  >
                    {tm("unblock.action")}
                  </Button>
                }
              />
            ))}
          </SettingsList>
        )}
      </SettingsSection>

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden rounded-2xl border-0 bg-marketplace-surface p-0 shadow-xl ring-1 ring-black/10 sm:max-w-md"
        >
          <DialogHeader className="space-y-2 px-6 pt-6 text-left sm:px-7 sm:pt-7">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {t("closeYourAccount")}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-marketplace-muted-foreground">
              {t("closeYourAccountHelp")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void closeAccount(event)}
            className="space-y-4 px-6 py-5 sm:px-7"
          >
            {error ? <SettingsAlert>{error}</SettingsAlert> : null}
            <ul className="space-y-2 text-sm text-marketplace-muted-foreground">
              <li>{t("closeAccountPoint1")}</li>
              <li>{t("closeAccountPoint2")}</li>
              <li>{t("closeAccountPoint3")}</li>
            </ul>
            <Field>
              <FieldLabel htmlFor="close-account-password">
                {t("closeAccountPassword")}
              </FieldLabel>
              <Input
                id="close-account-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <SettingsChoice
              id="close-account-confirm"
              variant="plain"
              checked={confirmed}
              onChange={setConfirmed}
              title={t("closeAccountConfirm")}
            />
            <div className="flex items-center justify-between gap-3 border-t border-marketplace-border-subtle pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                >
                  {t("cancel")}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="destructive"
                className="rounded-full"
                disabled={closing || !confirmed || !password}
              >
                {closing ? t("closingAccount") : t("closeAccount")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SettingsStack>
  );
}
