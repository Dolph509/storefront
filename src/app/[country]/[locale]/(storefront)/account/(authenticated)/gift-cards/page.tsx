import { Gift, Info } from "lucide-react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { GiftCardList } from "@/components/account/GiftCardList";
import { getGiftCards } from "@/lib/data/gift-cards";

interface GiftCardsPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function GiftCardsPage({ params }: GiftCardsPageProps) {
  await connection();
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "giftCards",
  });
  const response = await getGiftCards();
  const cards = response.data;

  return (
    <div>
      <AccountPageHeader title={t("giftCards")} />

      {cards.length === 0 ? (
        <div className="rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface p-12 text-center">
          <Gift className="mx-auto mb-4 h-12 w-12 text-marketplace-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-marketplace-foreground">
            {t("noGiftCards")}
          </h2>
          <p className="text-sm text-marketplace-muted-foreground">
            {t("noGiftCardsDescription")}
          </p>
        </div>
      ) : (
        <GiftCardList cards={cards} />
      )}

      <div className="mt-6 rounded-[var(--marketplace-radius-md)] bg-marketplace-muted/50 p-4">
        <p className="text-sm text-marketplace-muted-foreground">
          <Info className="w-4 h-4 inline mr-1" />
          {t("giftCardsHelpText")}
        </p>
      </div>
    </div>
  );
}
