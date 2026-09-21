"use client";

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
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        aria-pressed={notificationsEnabled}
        onClick={() => {
          startTransition(async () => {
            await updateSavedSearch(id, {
              notifications_enabled: !notificationsEnabled,
            });
            router.refresh();
          });
        }}
      >
        {notificationsEnabled ? t("notificationsOn") : t("notificationsOff")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await deleteSavedSearch(id);
            router.refresh();
          });
        }}
      >
        {t("deleteSavedSearch")}
      </Button>
    </>
  );
}
