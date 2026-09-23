"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface CartButtonProps {
  compact?: boolean;
}

export function CartButton({ compact = false }: CartButtonProps) {
  const t = useTranslations("header");
  const { itemCount, openCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (compact) {
    return (
      <button
        type="button"
        onClick={openCart}
        aria-label={t("openCart")}
        className="relative flex min-w-[3rem] flex-col items-center gap-0.5 px-0.5 py-0.5 text-[10px] font-medium text-[#2f2933] hover:opacity-80 sm:min-w-[3.75rem] sm:text-[11px]"
      >
        <span className="relative">
          <ShoppingBag className="size-6 stroke-[1.5]" aria-hidden />
          {mounted && itemCount > 0 ? (
            <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2f2933] px-0.5 text-[10px] font-semibold text-white">
              {itemCount}
            </span>
          ) : null}
        </span>
        <span className="leading-none">{t("cart")}</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={openCart}
      aria-label={t("openCart")}
      className="relative"
    >
      <ShoppingBag className="size-5" />
      {mounted && itemCount > 0 && (
        <span className="absolute top-0 right-0 bg-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );
}
