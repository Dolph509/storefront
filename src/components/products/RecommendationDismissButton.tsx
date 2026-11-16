"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function RecommendationDismissButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  const t = useTranslations("products");

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="pointer-events-auto size-8 rounded-full border border-marketplace-border-subtle bg-white/95 text-marketplace-muted-foreground shadow-sm hover:bg-white hover:text-marketplace-foreground"
      aria-label={t("dismissRecommendation")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      disabled={disabled}
    >
      <X className="size-4" aria-hidden />
    </Button>
  );
}
