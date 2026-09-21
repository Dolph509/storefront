"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
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
        "rounded-full bg-white/90 shadow-sm hover:bg-white relative z-[2]",
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
          saved ? "fill-red-500 text-red-500" : "text-gray-700",
        )}
        aria-hidden
      />
    </Button>
  );
}
