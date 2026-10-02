"use client";

import { Handbag } from "@phosphor-icons/react/dist/csr/Handbag";
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
          <Handbag className="size-6" weight="regular" aria-hidden />
          {mounted && itemCount > 0 ? (
            <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-marketplace-brand px-0.5 text-[9px] font-semibold text-marketplace-brand-foreground">
              {itemCount > 99 ? "99+" : itemCount}
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
      <Handbag className="size-5" weight="regular" aria-hidden />
      {mounted && itemCount > 0 && (
        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-marketplace-brand px-0.5 text-[9px] font-semibold text-marketplace-brand-foreground">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Button>
  );
}
