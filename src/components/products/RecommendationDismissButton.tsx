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
      className="pointer-events-auto !size-9 !rounded-full border-0 bg-white text-marketplace-foreground shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] hover:!bg-white hover:text-marketplace-foreground"
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
