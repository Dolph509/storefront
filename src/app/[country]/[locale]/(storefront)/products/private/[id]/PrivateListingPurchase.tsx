"use client";

import type { Product } from "@spree/sdk";
import { Loader2, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export function PrivateListingPurchase({ product }: { product: Product }) {
  const t = useTranslations("customOrders");
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const variantId = product.default_variant_id || product.variants?.[0]?.id;

  async function onPurchase() {
    if (!variantId) {
      toast.error(t("purchaseUnavailable"));
      return;
    }
    setAdding(true);
    try {
      await addItem(variantId, 1);
      toast.success(t("addedToCart"));
    } catch {
      toast.error(t("purchaseFailed"));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          {t("privateListingBadge")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {product.name}
        </h1>
        {product.price?.display_amount ? (
          <p className="mt-2 text-xl">{product.price.display_amount}</p>
        ) : null}
      </div>
      {product.description ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: product.description_html || product.description,
          }}
        />
      ) : null}
      <Button
        type="button"
        size="lg"
        disabled={adding || !variantId}
        onClick={onPurchase}
      >
        {adding ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <ShoppingBag className="mr-2 size-4" />
        )}
        {t("purchaseButton")}
      </Button>
    </div>
  );
}
