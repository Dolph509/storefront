"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LineItemReviewState } from "@/lib/reviews/line-item-review-state";
import { ReviewFormDialog, type ReviewFormTarget } from "./ReviewFormDialog";

interface LineItemReviewActionsProps {
  state: LineItemReviewState;
}

export function LineItemReviewActions({ state }: LineItemReviewActionsProps) {
  const t = useTranslations("reviews");
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<ReviewFormTarget | null>(null);

  if (state.kind === "none") return null;

  function openForm(next: ReviewFormTarget) {
    setTarget(next);
    setOpen(true);
  }

  if (state.kind === "write") {
    return (
      <div className="mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openForm({ mode: "create", purchase: state.purchase })}
        >
          {t("writeReview")}
        </Button>
        {open && target ? (
          <ReviewFormDialog target={target} onClose={() => setOpen(false)} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => openForm({ mode: "edit", review: state.review })}
      >
        {t("viewYourReview")}
      </Button>
      {state.editable ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openForm({ mode: "edit", review: state.review })}
        >
          {t("editReview")}
        </Button>
      ) : null}
      {open && target ? (
        <ReviewFormDialog target={target} onClose={() => setOpen(false)} />
      ) : null}
    </div>
  );
}
