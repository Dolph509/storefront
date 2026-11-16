"use client";

import { Bell, BellOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  deleteSavedSearch,
  updateSavedSearch,
} from "@/lib/data/saved-searches";

interface SavedSearchActionsProps {
  id: string;
  notificationsEnabled: boolean;
}

export function SavedSearchActions({
  id,
  notificationsEnabled,
}: SavedSearchActionsProps) {
  const t = useTranslations("account");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant={notificationsEnabled ? "secondary" : "ghost"}
        size="icon-sm"
        disabled={pending}
        aria-pressed={notificationsEnabled}
        aria-label={
          notificationsEnabled ? t("notificationsOn") : t("notificationsOff")
        }
        title={
          notificationsEnabled ? t("notificationsOn") : t("notificationsOff")
        }
        onClick={() => {
          startTransition(async () => {
            await updateSavedSearch(id, {
              notifications_enabled: !notificationsEnabled,
            });
            router.refresh();
          });
        }}
      >
        {notificationsEnabled ? (
          <Bell aria-hidden="true" />
        ) : (
          <BellOff aria-hidden="true" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={pending}
        aria-label={t("deleteSavedSearch")}
        title={t("deleteSavedSearch")}
        onClick={() => {
          startTransition(async () => {
            await deleteSavedSearch(id);
            router.refresh();
          });
        }}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}
