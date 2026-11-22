"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  onAdd: () => Promise<boolean>;
  disabled?: boolean;
  className?: string;
  /** External busy flag (e.g. personalization upload) shown as loading. */
  pending?: boolean;
  /** Fallback label when not purchasable. */
  unavailableLabel?: string;
  isPurchasable?: boolean;
};

type Phase = "idle" | "loading" | "success";

export function AddToCartButton({
  onAdd,
  disabled = false,
  className,
  pending = false,
  unavailableLabel,
  isPurchasable = true,
}: AddToCartButtonProps) {
  const t = useTranslations("products");
  const [phase, setPhase] = useState<Phase>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const showLoading = phase === "loading" || (pending && phase !== "success");
  const showSuccess = phase === "success";
  const isDisabled = disabled || showLoading || showSuccess || !isPurchasable;

  async function handleClick() {
    if (disabled || showLoading || showSuccess || !isPurchasable) return;
    setPhase("loading");
    try {
      const ok = await onAdd();
      if (!ok) {
        setPhase("idle");
        return;
      }
      setPhase("success");
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setPhase("idle"), 1600);
    } catch {
      setPhase("idle");
    }
  }

  const label = !isPurchasable
    ? (unavailableLabel ?? t("outOfStock"))
    : showSuccess
      ? t("addedToCart")
      : showLoading
        ? t("adding")
        : t("addToCart");

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => void handleClick()}
      data-phase={showSuccess ? "success" : showLoading ? "loading" : "idle"}
      className={cn(
        "relative inline-flex w-full items-center justify-center overflow-hidden rounded-full border-0 bg-marketplace-brand px-5 font-semibold text-marketplace-brand-foreground transition-[background-color,transform,box-shadow] duration-150 ease-out",
        "hover:enabled:bg-[color-mix(in_srgb,var(--marketplace-brand)_88%,black)] hover:enabled:shadow-[0_8px_20px_color-mix(in_srgb,var(--marketplace-brand)_28%,transparent)]",
        "active:enabled:scale-[0.985] active:enabled:duration-100",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        "h-[3.125rem] text-[0.96875rem] md:h-[3.375rem] md:text-base",
        showSuccess &&
          "bg-[color-mix(in_srgb,var(--marketplace-brand)_86%,white)] hover:enabled:bg-[color-mix(in_srgb,var(--marketplace-brand)_86%,white)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(110deg,transparent_10%,rgba(255,255,255,0.22)_50%,transparent_90%)] opacity-0",
          showLoading &&
            "animate-[atc-shimmer_2.2s_ease-in-out_infinite] opacity-100 motion-reduce:animate-none motion-reduce:opacity-0",
        )}
      />
      <span
        className={cn(
          "relative truncate",
          showSuccess &&
            "animate-[atc-label-in_280ms_cubic-bezier(0.23,1,0.32,1)_both] motion-reduce:animate-none",
        )}
      >
        {label}
      </span>
    </button>
  );
}
