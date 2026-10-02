import { CreditCard, Lock } from "lucide-react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { CreditCardList } from "@/components/account/CreditCardList";
import { getCreditCards } from "@/lib/data/credit-cards";

interface CreditCardsPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function CreditCardsPage({
  params,
}: CreditCardsPageProps) {
  await connection();
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "creditCards",
  });
  const response = await getCreditCards();
  const cards = response.data;

  return (
    <div>
      <AccountPageHeader title={t("paymentMethods")} />

      {cards.length === 0 ? (
        <div className="rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface p-12 text-center">
          <CreditCard className="mx-auto mb-4 h-12 w-12 text-marketplace-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-marketplace-foreground">
            {t("noCards")}
          </h2>
          <p className="text-sm text-marketplace-muted-foreground">
            {t("noCardsDescription")}
          </p>
        </div>
      ) : (
        <CreditCardList initialCards={cards} />
      )}

      <div className="mt-6 rounded-[var(--marketplace-radius-md)] bg-marketplace-muted/50 p-4">
        <p className="text-sm text-marketplace-muted-foreground">
          <Lock className="w-4 h-4 inline mr-1" />
          {t("secureInfo")}
        </p>
      </div>
    </div>
  );
}
