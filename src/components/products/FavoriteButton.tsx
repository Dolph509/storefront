"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Heart } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addFavorite, removeFavorite } from "@/lib/data/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  variantId?: string | null;
  favorited?: boolean;
  onChange?: (productId: string, favorited: boolean) => void;
  className?: string;
}

export function FavoriteButton({
  productId,
  variantId,
  favorited = false,
  onChange,
  className,
}: FavoriteButtonProps) {
  const t = useTranslations("products");
  const { isAuthenticated } = useAuth();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(favorited);

  const label = saved ? t("removeFavorite") : t("addFavorite");

  const toggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      // Guests: leave as a no-op visual prompt via aria; account gate is sign-in.
      return;
    }

    const next = !saved;
    setSaved(next);
    onChange?.(productId, next);

    startTransition(async () => {
      try {
        const result = next
          ? await addFavorite({ productId, variantId: variantId ?? undefined })
          : await removeFavorite({
              productId,
              variantId: variantId ?? undefined,
            });
        if (!result.success) {
          setSaved(!next);
          onChange?.(productId, !next);
        }
      } catch {
        setSaved(!next);
        onChange?.(productId, !next);
      }
    });
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-xs"
      className={cn(
        "relative z-[2] rounded-full bg-white/90 hover:bg-white",
        className,
      )}
      aria-label={label}
      aria-pressed={saved}
      disabled={pending || !isAuthenticated}
      title={!isAuthenticated ? t("favoriteSignIn") : label}
      onClick={toggle}
    >
      <Heart
        className={cn(
          "size-4",
          saved
            ? "fill-marketplace-brand text-marketplace-brand"
            : "text-marketplace-foreground",
        )}
        aria-hidden
      />
    </Button>
  );
}
