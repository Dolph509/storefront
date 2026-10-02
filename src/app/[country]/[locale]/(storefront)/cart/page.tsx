"use client";

import type { LineItem } from "@spree/sdk";
import { Heart, LockKeyhole, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { CartLineItems } from "@/components/cart/CartLineItems";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { trackRemoveFromCart, trackViewCart } from "@/lib/analytics/gtm";
import {
  themeSettingColor,
  themeSettingEnabled,
} from "@/lib/theme/setting-value";
import { extractBasePath } from "@/lib/utils/path";

const ExpressCheckoutButton = dynamic(
  () =>
    import("@/components/checkout/ExpressCheckoutButton").then((m) => ({
      default: m.ExpressCheckoutButton,
    })),
  { ssr: false },
);

export default function CartPage() {
  const { cart, loading, updating, updateItem, removeItem } = useCart();
  const [expressProcessing, setExpressProcessing] = useState(false);
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const viewCartFiredRef = useRef(false);
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const themeSettings = useStoreThemeSettings();
  const cartSettings = themeSettings.cart || {};
  const checkoutSettings = themeSettings.checkout || {};
  const cartPageStyle: CSSProperties = {
    backgroundColor: themeSettingColor(
      cartSettings.background_color,
      "--marketplace-surface",
    ),
    color: themeSettingColor(
      cartSettings.text_color,
      "--marketplace-foreground",
    ),
  };
  const cartSummaryStyle: CSSProperties = {
    ...cartPageStyle,
    borderColor: themeSettingColor(
      cartSettings.border_color,
      "--marketplace-border",
    ),
  };

  useEffect(() => {
    if (
      !loading &&
      cart &&
      cart.total_quantity > 0 &&
      !viewCartFiredRef.current
    ) {
      trackViewCart(cart);
      viewCartFiredRef.current = true;
    }
  }, [cart, loading]);

  const handleRemove = async (item: LineItem) => {
    await removeItem(item.id);
    if (cart) {
      trackRemoveFromCart(item, cart.currency);
    }
  };

  if (loading) {
    return (
      <div
        data-theme-cart-page
        className="mx-auto max-w-[var(--marketplace-container,1360px)] px-4 py-8 sm:px-6 lg:px-8"
        style={cartPageStyle}
      >
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-32 rounded bg-marketplace-muted" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded bg-marketplace-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div
        data-theme-cart-page
        className="mx-auto max-w-[var(--marketplace-container,1360px)] px-4 py-16 sm:px-6 lg:px-8"
        style={cartPageStyle}
      >
        <div className="mx-auto max-w-md text-center">
          <EmptyStateIllustration
            name="empty-cart"
            size={96}
            className="mx-auto text-marketplace-muted-foreground"
          />
          <h1 className="mt-4 text-2xl font-bold text-marketplace-foreground">
            {t("emptyCart")}
          </h1>
          <p className="mt-2 text-sm text-marketplace-muted-foreground">
            {t("emptyCartDescription")}
          </p>
          {themeSettingEnabled(cartSettings.show_continue_shopping, true) && (
            <div className="mt-6">
              <Button size="lg" asChild>
                <Link href={`${basePath}/products`}>
                  {tc("continueShopping")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme-cart-page
      className="mx-auto max-w-[var(--marketplace-container,1360px)] px-4 py-6 sm:px-6 lg:py-8"
      style={cartPageStyle}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-marketplace-foreground md:text-3xl">
            {t("shoppingCart")}
          </h1>
          <p className="mt-1 text-sm text-marketplace-muted-foreground">
            {t("cartPageSubtitle")}
          </p>
        </div>
        {themeSettingEnabled(cartSettings.show_continue_shopping, true) && (
          <Link
            href={`${basePath}/products`}
            className="text-sm font-semibold text-marketplace-brand hover:underline"
          >
            {tc("continueShopping")} →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-8">
        <div>
          <CartLineItems
            items={cart.items}
            basePath={basePath}
            updating={updating}
            onRemove={handleRemove}
            onUpdateQuantity={(itemId, quantity) =>
              updateItem(itemId, quantity)
            }
          />
        </div>

        <div>
          <div
            data-theme-cart-summary
            className="sticky top-24 rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface p-5 shadow-[var(--marketplace-shadow-card)] sm:p-6"
            style={cartSummaryStyle}
          >
            {themeSettingEnabled(checkoutSettings.show_order_summary, true) && (
              <h2 className="text-lg font-semibold text-marketplace-foreground">
                {tc("orderSummary")}
              </h2>
            )}

            {themeSettingEnabled(checkoutSettings.show_order_summary, true) && (
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-marketplace-muted-foreground">
                    {tc("subtotal")}
                  </dt>
                  <dd className="font-medium text-marketplace-foreground">
                    {cart.display_item_total}
                  </dd>
                </div>
                {cart.discount_total && parseFloat(cart.discount_total) < 0 && (
                  <div className="flex justify-between gap-4 text-marketplace-sale">
                    <dt>{tc("discount")}</dt>
                    <dd>{cart.display_discount_total}</dd>
                  </div>
                )}
                {(cart.fees ?? [])
                  .filter((fee) => fee.kind === "personalization")
                  .map((fee) => (
                    <div key={fee.id} className="flex justify-between gap-4">
                      <dt className="text-marketplace-muted-foreground">
                        {fee.label}
                      </dt>
                      <dd className="text-marketplace-foreground">
                        {fee.display_amount}
                      </dd>
                    </div>
                  ))}
                {cart.delivery_total && parseFloat(cart.delivery_total) > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-marketplace-muted-foreground">
                      {tc("shipping")}
                    </dt>
                    <dd className="text-marketplace-foreground">
                      {cart.display_delivery_total}
                    </dd>
                  </div>
                )}
                {!(
                  cart.delivery_total && parseFloat(cart.delivery_total) > 0
                ) && (
                  <p className="text-xs text-marketplace-muted-foreground">
                    {t("shippingCalculatedAtCheckout")}
                  </p>
                )}
                {cart.tax_total && parseFloat(cart.tax_total) > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-marketplace-muted-foreground">
                      {tc("tax")}
                    </dt>
                    <dd className="text-marketplace-foreground">
                      {cart.display_tax_total}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-marketplace-border-subtle pt-3">
                  <dt className="text-base font-semibold text-marketplace-foreground">
                    {tc("total")}
                  </dt>
                  <dd className="text-base font-bold tabular-nums text-marketplace-foreground">
                    {cart.display_total}
                  </dd>
                </div>

                {cart.gift_card &&
                parseFloat(cart.gift_card_total ?? "0") > 0 ? (
                  <div className="flex justify-between gap-4 text-marketplace-sale">
                    <dt>{t("giftCard")}</dt>
                    <dd>-{cart.display_gift_card_total}</dd>
                  </div>
                ) : cart.store_credit_total &&
                  parseFloat(cart.store_credit_total) > 0 ? (
                  <div className="flex justify-between gap-4 text-marketplace-sale">
                    <dt>{t("storeCredit")}</dt>
                    <dd>-{cart.display_store_credit_total}</dd>
                  </div>
                ) : null}

                {cart.amount_due &&
                  cart.amount_due !== cart.total &&
                  parseFloat(cart.amount_due) > 0 && (
                    <div className="flex justify-between gap-4 border-t border-marketplace-border-subtle pt-3">
                      <dt className="font-semibold text-marketplace-foreground">
                        {t("amountDue")}
                      </dt>
                      <dd className="font-bold tabular-nums text-marketplace-foreground">
                        {cart.display_amount_due}
                      </dd>
                    </div>
                  )}
              </dl>
            )}

            <div className="mt-6 space-y-3">
              {themeSettingEnabled(
                checkoutSettings.show_express_checkout,
                true,
              ) &&
                parseFloat(cart.total ?? "0") > 0 && (
                  <ExpressCheckoutButton
                    cart={cart}
                    basePath={basePath}
                    onComplete={() => {}}
                    onProcessingChange={setExpressProcessing}
                  />
                )}
              {!expressProcessing && (
                <>
                  {themeSettingEnabled(
                    cartSettings.show_checkout_button,
                    true,
                  ) && (
                    <Button
                      size="lg"
                      asChild
                      className="w-full bg-marketplace-brand text-white hover:bg-marketplace-brand/90"
                    >
                      <Link href={`${basePath}/checkout/${cart.id}`}>
                        {t("proceedToCheckout")}
                      </Link>
                    </Button>
                  )}
                  {themeSettingEnabled(
                    cartSettings.show_continue_shopping,
                    true,
                  ) && (
                    <Button variant="link" asChild className="w-full">
                      <Link href={`${basePath}/products`}>
                        {tc("continueShopping")}
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="mt-5 space-y-3 border-t border-marketplace-border-subtle pt-4 text-sm text-marketplace-muted-foreground">
              <p className="flex gap-2.5">
                <LockKeyhole
                  className="size-4 shrink-0 text-marketplace-brand"
                  aria-hidden
                />
                {t("trustSecureCheckout")}
              </p>
              <p className="flex gap-2.5">
                <ShieldCheck
                  className="size-4 shrink-0 text-marketplace-brand"
                  aria-hidden
                />
                {t("trustBuyerProtection")}
              </p>
              <p className="flex gap-2.5">
                <Heart
                  className="size-4 shrink-0 text-marketplace-brand"
                  aria-hidden
                />
                {t("trustIndependentMakers")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
