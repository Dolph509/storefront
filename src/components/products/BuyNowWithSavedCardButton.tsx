"use client";

import type { CreditCard } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCardIconType, getCardLabel } from "@/lib/utils/credit-card";

export interface BuyNowWithSavedCardButtonProps {
  card: CreditCard;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
  layout?: "classic" | "oddkeeps";
  className?: string;
  fallbackClassName?: string;
}

export function BuyNowWithSavedCardButton({
  card,
  disabled = false,
  onClick,
  layout = "classic",
  className,
  fallbackClassName,
}: BuyNowWithSavedCardButtonProps) {
  const t = useTranslations("products");
  const label = layout === "oddkeeps" ? t("buyNow") : t("buyItNow");
  const ariaLabel = t("buyItNowWithCard", {
    brand: getCardLabel(card.brand),
    last4: card.last4,
  });

  const content = (
    <>
      <span className="font-semibold">{label}</span>
      <span className="text-marketplace-muted-foreground" aria-hidden>
        {"|"}
      </span>
      <PaymentIcon
        type={getCardIconType(card.brand)}
        format="flatRounded"
        width={layout === "oddkeeps" ? 30 : 34}
        aria-hidden
      />
      <span className="tabular-nums text-marketplace-foreground">
        ···{card.last4}
      </span>
    </>
  );

  if (layout === "oddkeeps") {
    return (
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={() => void onClick()}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[#1a1a1a] bg-white px-4 text-[14.5px] text-[#1a1a1a] transition-colors hover:bg-[#f2f6f4] disabled:cursor-not-allowed disabled:opacity-50 md:h-[3.375rem] md:text-[15.5px]",
          "h-[2.875rem]",
          fallbackClassName,
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => void onClick()}
      className={cn(
        "h-12 w-full gap-2 rounded-full border-marketplace-foreground bg-marketplace-surface text-[16px] font-normal text-marketplace-foreground hover:bg-marketplace-accent",
        fallbackClassName,
        className,
      )}
    >
      {content}
    </Button>
  );
}
