"use client";

import type { Cart, CreditCard } from "@spree/sdk";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BuyNowWithSavedCardButton } from "@/components/products/BuyNowWithSavedCardButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { getCreditCards } from "@/lib/data/credit-cards";
import { themeSettingEnabled } from "@/lib/theme/setting-value";
import { cn } from "@/lib/utils";
import {
  buildExpressPreviewCart,
  hasPayableTotal,
} from "@/lib/utils/express-checkout";
import { isStripeConfigured } from "@/lib/utils/stripe";

const ExpressCheckoutButton = dynamic(
  () =>
    import("@/components/checkout/ExpressCheckoutButton").then((module) => ({
      default: module.ExpressCheckoutButton,
    })),
  { ssr: false },
);

export interface ProductBuyNowExpressProps {
  basePath: string;
  currency: string;
  previewAmountCents: number | null;
  /** Resets wallet preview when variant, quantity, or personalization changes. */
  configurationKey: string;
  prepareCart: () => Promise<Cart | null>;
  onBuyNowFallback: () => void | Promise<void>;
  disabled: boolean;
  layout?: "classic" | "oddkeeps";
  className?: string;
  fallbackClassName?: string;
}

export function ProductBuyNowExpress({
  basePath,
  currency,
  previewAmountCents,
  configurationKey,
  prepareCart,
  onBuyNowFallback,
  disabled,
  layout = "classic",
  className,
  fallbackClassName,
}: ProductBuyNowExpressProps) {
  const t = useTranslations("products");
  const { isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { checkout: checkoutSettings = {} } = useStoreThemeSettings();
  const [savedCard, setSavedCard] = useState<CreditCard | null | undefined>(
    isAuthenticated ? undefined : null,
  );
  const expressEnabled =
    themeSettingEnabled(checkoutSettings.show_express_checkout, true) &&
    isStripeConfigured;
  const [expressCart, setExpressCart] = useState<Cart | null>(null);
  const [walletAvailable, setWalletAvailable] = useState<boolean | null>(
    expressEnabled ? null : false,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedCard(null);
      return;
    }
    let cancelled = false;
    void getCreditCards().then(({ data }) => {
      if (cancelled) return;
      const vaultable = data.filter((card) => card.gateway_payment_profile_id);
      const defaultCard =
        vaultable.find((card) => card.default) ?? vaultable[0] ?? null;
      setSavedCard(defaultCard);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, configurationKey]);

  useEffect(() => {
    setExpressCart(null);
    if (expressEnabled) {
      setWalletAvailable(null);
    }
  }, [configurationKey, expressEnabled]);

  const ensureCart = useCallback(async () => {
    if (disabled) return null;
    const prepared = await prepareCart();
    if (prepared) setExpressCart(prepared);
    return prepared;
  }, [disabled, prepareCart]);

  const mountCart = useMemo((): Cart | null => {
    if (expressCart) return expressCart;
    if (cart && hasPayableTotal(cart)) return cart;
    if (previewAmountCents != null && previewAmountCents > 0) {
      return buildExpressPreviewCart(currency, previewAmountCents);
    }
    return null;
  }, [cart, currency, expressCart, previewAmountCents]);

  const savedCardReady = !isAuthenticated || savedCard !== undefined;
  const showSavedCard = Boolean(savedCard?.gateway_payment_profile_id);

  const showExpress =
    savedCardReady &&
    !showSavedCard &&
    expressEnabled &&
    walletAvailable !== false &&
    mountCart != null &&
    !disabled;

  const fallbackLabel = layout === "oddkeeps" ? t("buyNow") : t("buyItNow");

  const wrapperClass = cn(
    layout === "classic" && "hidden w-full md:inline-flex",
    className,
  );

  if (isAuthenticated && !savedCardReady) {
    return (
      <div
        className={cn(
          wrapperClass,
          layout === "classic"
            ? "min-h-12"
            : "min-h-[2.875rem] md:min-h-[3.375rem]",
        )}
        aria-hidden
      />
    );
  }

  if (showSavedCard && savedCard) {
    return (
      <div className={wrapperClass} data-pdp-buy-now-saved-card>
        <BuyNowWithSavedCardButton
          card={savedCard}
          disabled={disabled}
          layout={layout}
          fallbackClassName={fallbackClassName}
          onClick={onBuyNowFallback}
        />
      </div>
    );
  }

  const fallbackButton =
    layout === "oddkeeps" ? (
      <button
        type="button"
        disabled={disabled}
        onClick={() => void onBuyNowFallback()}
        className={cn(fallbackClassName, disabled && "opacity-50")}
      >
        {fallbackLabel}
      </button>
    ) : (
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => void onBuyNowFallback()}
        disabled={disabled}
        className={cn(
          "h-12 w-full rounded-xl border border-marketplace-foreground bg-marketplace-surface text-[16px] font-semibold text-marketplace-foreground hover:bg-marketplace-accent",
          fallbackClassName,
        )}
      >
        {fallbackLabel}
      </Button>
    );

  if (!showExpress) {
    return <div className={wrapperClass}>{fallbackButton}</div>;
  }

  return (
    <div
      className={cn(
        "w-full",
        layout === "classic" && "hidden min-h-12 md:block",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      data-pdp-express-checkout
    >
      <ExpressCheckoutButton
        cart={mountCart}
        basePath={basePath}
        ensureCart={ensureCart}
        showDivider={false}
        maxColumns={1}
        onComplete={() => {}}
        onAvailabilityChange={setWalletAvailable}
      />
    </div>
  );
}
