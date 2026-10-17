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
      ? "data-[side=left]:sm:max-w-xl data-[side=right]:sm:max-w-xl"
      : cartSettings.drawer_width === "compact"
        ? "data-[side=left]:sm:max-w-72 data-[side=right]:sm:max-w-72"
        : "data-[side=left]:sm:max-w-xs data-[side=right]:sm:max-w-xs";
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const viewCartFiredRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  // Close when navigating
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      closeCart();
    }
  }, [pathname, closeCart]);

  // Track view_cart when drawer opens with items (fire once per open)
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
        className={`data-[side=left]:w-full data-[side=right]:w-full ${drawerWidth} flex flex-col gap-0 p-0`}
        style={cartStyle}
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <SheetHeader
          className="gap-0 border-b p-4"
          style={{ borderColor: "var(--theme-cart-border, #e5e7eb)" }}
        >
          <SheetTitle className="sr-only">{t("cart")}</SheetTitle>
          {!isEmpty && !loading ? (
            <Button
              size="lg"
              className="w-full rounded-md bg-marketplace-foreground text-marketplace-background hover:bg-marketplace-foreground/90"
              asChild
            >
              <Link href={`${basePath}/cart`} onClick={closeCart}>
                {t("viewCart")}
              </Link>
            </Button>
          ) : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="size-[5.5rem] bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <EmptyStateIllustration
                name="empty-cart"
                className="mb-4 text-gray-600"
              />
              <p className="text-gray-500 mb-4">{t("emptyCart")}</p>
              {themeSettingEnabled(
                cartSettings.show_continue_shopping,
                true,
              ) && (
                <Link
                  href={`${basePath}/products`}
                  className="text-primary hover:text-primary font-medium"
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

        {/* Loading overlay */}
        {updating && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
