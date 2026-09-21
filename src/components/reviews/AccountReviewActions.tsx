"use client";

import type { ProductReview, ReviewablePurchase } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReviewFormDialog, type ReviewFormTarget } from "./ReviewFormDialog";

type AccountReviewActionsProps =
  | { mode: "create"; purchase: ReviewablePurchase }
  | { mode: "edit"; review: ProductReview; editable: boolean };

export function AccountReviewActions(props: AccountReviewActionsProps) {
  const t = useTranslations("reviews");
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<ReviewFormTarget | null>(null);

  function openForm(next: ReviewFormTarget) {
    setTarget(next);
    setOpen(true);
  }

  if (props.mode === "create") {
    return (
      <>
        <Button
          type="button"
          size="sm"
          onClick={() => openForm({ mode: "create", purchase: props.purchase })}
        >
          {t("writeReview")}
        </Button>
        {open && target ? (
          <ReviewFormDialog target={target} onClose={() => setOpen(false)} />
        ) : null}
      </>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => openForm({ mode: "edit", review: props.review })}
      >
        {t("viewYourReview")}
      </Button>
      {props.editable ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openForm({ mode: "edit", review: props.review })}
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
