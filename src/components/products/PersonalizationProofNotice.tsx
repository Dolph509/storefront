"use client";

import { ClipboardCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function PersonalizationProofNotice() {
  const t = useTranslations("personalization");

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-marketplace-border-subtle bg-marketplace-surface px-4 py-3.5 shadow-[var(--marketplace-shadow-card)]"
      role="note"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-marketplace-muted text-marketplace-foreground ring-1 ring-marketplace-border-subtle"
        aria-hidden
      >
        <ClipboardCheck className="size-[18px]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold leading-snug text-marketplace-foreground">
          {t("proofRequiredTitle")}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-marketplace-muted-foreground">
          {t("proofRequiredBody")}
        </p>
      </div>
    </div>
  );
}
