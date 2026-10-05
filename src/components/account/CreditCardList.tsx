"use client";

import type { CreditCard as SpreeCreditCard } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";
import {
  SettingsBadge,
  SettingsEmpty,
  SettingsList,
  SettingsListItem,
} from "@/components/account/SettingsSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCreditCard } from "@/lib/data/credit-cards";
import { getCardIconType, getCardLabel } from "@/lib/utils/credit-card";

function CreditCardItem({
  card,
  onDelete,
}: {
  card: SpreeCreditCard;
  onDelete: () => void;
}) {
  const t = useTranslations("creditCards");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const expiry = t("cardExpires", {
    month: String(card.month).padStart(2, "0"),
    year: String(card.year),
  });

  return (
    <SettingsListItem
      icon={
        <PaymentIcon
          type={getCardIconType(card.brand)}
          format="flatRounded"
          width={32}
        />
      }
      title={t("cardEndingIn", {
        label: getCardLabel(card.brand),
        digits: card.last4,
      })}
      description={card.name ? `${expiry} · ${card.name}` : expiry}
      badge={
        card.default ? (
          <SettingsBadge tone="brand">{t("default")}</SettingsBadge>
        ) : null
      }
      action={
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={deleting}>
              {deleting ? t("removing") : t("remove")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("removePaymentMethodTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirmRemoveDescription", {
                  label: getCardLabel(card.brand),
                  digits: card.last4,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => void handleDelete()}
              >
                {t("remove")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
    />
  );
}

interface CreditCardListProps {
  initialCards: SpreeCreditCard[];
}

export function CreditCardList({ initialCards }: CreditCardListProps) {
  const t = useTranslations("creditCards");
  const [cards, setCards] = useState<SpreeCreditCard[]>(initialCards);

  const handleDelete = async (id: string) => {
    const result = await deleteCreditCard(id);
    if (result.success) {
      setCards((prev) => prev.filter((card) => card.id !== id));
    } else {
      alert(t("failedToRemove"));
    }
  };

  if (cards.length === 0) {
    return <SettingsEmpty>{t("noCards")}</SettingsEmpty>;
  }

  return (
    <SettingsList>
      {cards.map((card) => (
        <CreditCardItem
          key={card.id}
          card={card}
          onDelete={() => handleDelete(card.id)}
        />
      ))}
    </SettingsList>
  );
}
