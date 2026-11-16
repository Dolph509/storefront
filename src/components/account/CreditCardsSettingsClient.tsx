"use client";

import type { CreditCard as SpreeCreditCard } from "@spree/sdk";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AddCreditCardForm } from "@/components/account/AddCreditCardForm";
import { CreditCardList } from "@/components/account/CreditCardList";
import {
  SettingsSection,
  SettingsStack,
} from "@/components/account/SettingsSection";

export function CreditCardsSettingsClient({
  initialCards,
}: {
  initialCards: SpreeCreditCard[];
}) {
  const t = useTranslations("creditCards");
  const router = useRouter();

  return (
    <SettingsStack>
      <SettingsSection
        title={t("paymentMethods")}
        description={t("addCardHelp")}
        footer={
          <p className="flex items-start gap-2 text-sm text-marketplace-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{t("secureInfo")}</span>
          </p>
        }
      >
        <div className="rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface-warm/30 p-4 sm:p-5">
          <AddCreditCardForm onAdded={() => router.refresh()} />
        </div>
        <CreditCardList initialCards={initialCards} />
      </SettingsSection>
    </SettingsStack>
  );
}
