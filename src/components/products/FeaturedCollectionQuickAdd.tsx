"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export function FeaturedCollectionQuickAdd({
  variantId,
}: {
  variantId: string;
}) {
  const { addItem, openCart } = useCart();
  const [pending, setPending] = useState(false);

  async function add() {
    if (!variantId || pending) return;
    setPending(true);
    try {
      const result = await addItem(variantId, 1);
      if (result.success) openCart();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={!variantId || pending}
      onClick={add}
      className="relative z-[2] mt-2 w-full rounded-md border border-marketplace-border bg-marketplace-surface px-3 py-2 text-sm font-medium text-marketplace-foreground disabled:opacity-60"
    >
      {pending ? "Adding…" : "Quick add"}
    </button>
  );
}
