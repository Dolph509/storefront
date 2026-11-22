"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface ProductMobileStickyPurchaseBarProps {
  visible: boolean;
  displayPrice: string | null | undefined;
  compareAtPrice?: string | null;
  busy: boolean;
  isPurchasable: boolean;
  purchaseReady: boolean;
  onAddToCart: () => Promise<boolean>;
}

export function ProductMobileStickyPurchaseBar({
  visible,
  displayPrice,
  compareAtPrice,
  busy,
  isPurchasable,
  purchaseReady,
  onAddToCart,
}: ProductMobileStickyPurchaseBarProps) {
  const t = useTranslations("products");
  const { isOpen: cartDrawerOpen } = useCart();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!visible || cartDrawerOpen || !portalTarget) return null;

  return createPortal(
    <section
      data-product-sticky-purchase="true"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-[#eae7e2] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(26,26,26,0.08)] backdrop-blur-md motion-reduce:backdrop-blur-none md:hidden",
        "motion-reduce:transition-none transition-transform duration-200 ease-out",
      )}
      aria-label={t("addToCart")}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3.5 px-4 py-2.5">
        {displayPrice ? (
          <div className="flex shrink-0 flex-col">
            <span className="text-[18px] font-bold leading-tight tracking-tight text-[#1a1a1a]">
              {displayPrice}
            </span>
            {compareAtPrice ? (
              <span className="text-[12px] leading-tight text-[#6f6c68] line-through">
                {compareAtPrice}
              </span>
            ) : null}
          </div>
        ) : null}
        <AddToCartButton
          onAdd={onAddToCart}
          disabled={!purchaseReady}
          pending={busy}
          isPurchasable={isPurchasable}
          className="h-11 min-h-11 flex-1 text-[15px] md:h-11"
        />
      </div>
    </section>,
    portalTarget,
  );
}
