"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { CartLineItems } from "@/components/cart/CartLineItems";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { trackViewCart } from "@/lib/analytics/gtm";
import {
  themeSettingColor,
  themeSettingEnabled,
} from "@/lib/theme/setting-value";
import { extractBasePath } from "@/lib/utils/path";

/** Etsy-style mini cart rail widths */
const DRAWER_WIDTH = {
  wide: "data-[side=left]:!w-[13rem] data-[side=right]:!w-[13rem] data-[side=left]:sm:!max-w-[13rem] data-[side=right]:sm:!max-w-[13rem]",
  compact:
    "data-[side=left]:!w-[8.5rem] data-[side=right]:!w-[8.5rem] data-[side=left]:sm:!max-w-[8.5rem] data-[side=right]:sm:!max-w-[8.5rem]",
  default:
    "data-[side=left]:!w-[9.75rem] data-[side=right]:!w-[9.75rem] data-[side=left]:sm:!max-w-[9.75rem] data-[side=right]:sm:!max-w-[9.75rem]",
} as const;

export function CartDrawer({
  settings = {},
}: {
  settings?: {
    cart?: Record<string, string | boolean>;
    checkout?: Record<string, string | boolean>;
  };
}) {
  const { cart, loading, updating, isOpen, closeCart } = useCart();
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const liveThemeSettings = useStoreThemeSettings();
  const cartSettings = liveThemeSettings.cart ?? settings.cart ?? {};
  const cartBorderColor = themeSettingColor(
    cartSettings.border_color,
    "--marketplace-border",
  );
  const cartStyle = {
    backgroundColor: themeSettingColor(
      cartSettings.background_color,
      "--marketplace-surface",
    ),
    color: themeSettingColor(
      cartSettings.text_color,
      "--marketplace-foreground",
    ),
    borderColor: cartBorderColor,
    "--theme-cart-border": cartBorderColor,
  } as CSSProperties;
  const drawerSide = cartSettings.drawer_position === "left" ? "left" : "right";
  const drawerWidth =
    cartSettings.drawer_width === "wide"
      ? DRAWER_WIDTH.wide
      : cartSettings.drawer_width === "compact"
        ? DRAWER_WIDTH.compact
        : DRAWER_WIDTH.default;
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const viewCartFiredRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      closeCart();
    }
  }, [pathname, closeCart]);

  useEffect(() => {
    if (
      isOpen &&
      cart &&
      cart.total_quantity > 0 &&
      !viewCartFiredRef.current
    ) {
      trackViewCart(cart);
      viewCartFiredRef.current = true;
    }
    if (!isOpen) {
      viewCartFiredRef.current = false;
    }
  }, [isOpen, cart]);

  const lineItems = cart?.items || [];
  const isEmpty = lineItems.length === 0;
  const cartTotal = cart?.display_item_total || cart?.display_total || null;
  const showCheckout =
    themeSettingEnabled(cartSettings.show_checkout_button, true) &&
    Boolean(cart?.id);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeCart();
        }
      }}
    >
      <SheetContent
        side={drawerSide}
        className={`${drawerWidth} flex flex-col gap-0 p-0`}
        style={cartStyle}
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <SheetHeader className="gap-1.5 border-b border-transparent px-2.5 pb-3 pt-3">
          <SheetTitle className="sr-only">{t("cart")}</SheetTitle>
          {!isEmpty && !loading ? (
            <div className="flex w-full flex-col gap-2">
              {showCheckout ? (
                <Button
                  size="sm"
                  className="h-9 w-full rounded-md bg-marketplace-brand px-2 text-[13px] font-semibold text-marketplace-brand-foreground hover:bg-marketplace-brand-accent-hover"
                  asChild
                >
                  <Link
                    href={`${basePath}/checkout/${cart!.id}`}
                    onClick={closeCart}
                  >
                    {t("checkout")}
                  </Link>
                </Button>
              ) : null}
              <Button
                size="sm"
                variant={showCheckout ? "outline" : "default"}
                className={
                  showCheckout
                    ? "h-9 w-full rounded-md border-marketplace-border px-2 text-[13px] font-semibold"
                    : "h-9 w-full rounded-md bg-marketplace-brand px-2 text-[13px] font-semibold text-marketplace-brand-foreground hover:bg-marketplace-brand-accent-hover"
                }
                asChild
              >
                <Link href={`${basePath}/cart`} onClick={closeCart}>
                  {t("viewCart")}
                </Link>
              </Button>
              {cartTotal ? (
                <p className="text-center text-[13px] font-semibold tabular-nums text-marketplace-foreground">
                  {cartTotal}
                </p>
              ) : null}
            </div>
          ) : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-4 px-2.5 py-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="aspect-square w-full rounded-md bg-gray-200" />
                  <div className="mx-auto h-3 w-2/3 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center px-2.5 py-8 text-center">
              <EmptyStateIllustration
                name="empty-cart"
                className="mb-3 size-12 text-gray-600"
              />
              <p className="mb-3 text-xs text-gray-500">{t("emptyCart")}</p>
              {themeSettingEnabled(
                cartSettings.show_continue_shopping,
                true,
              ) && (
                <Link
                  href={`${basePath}/products`}
                  className="text-xs font-medium text-marketplace-brand hover:underline"
                  onClick={closeCart}
                >
                  {tc("continueShopping")}
                </Link>
              )}
            </div>
          ) : (
            <CartLineItems
              items={lineItems}
              basePath={basePath}
              compact
              onClose={closeCart}
              onRemove={() => undefined}
              onUpdateQuantity={() => undefined}
            />
          )}
        </div>

        {updating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
