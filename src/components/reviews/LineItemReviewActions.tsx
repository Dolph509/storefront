"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import type { LineItemReviewState } from "@/lib/reviews/line-item-review-state";
import { ReviewFormDialog, type ReviewFormTarget } from "./ReviewFormDialog";
import { StarRatingDisplay } from "./StarRating";

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
      <div className="shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-marketplace-foreground px-5 text-marketplace-foreground hover:bg-marketplace-surface-warm"
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

  const detailRatings = [
    {
      label: t("itemQualityRating"),
      rating: state.review.item_quality_rating,
    },
    { label: t("shippingRating"), rating: state.review.shipping_rating },
    {
      label: t("customerServiceRating"),
      rating: state.review.customer_service_rating,
    },
  ].filter(
    (item): item is { label: string; rating: number } => item.rating != null,
  );

  return (
    <div className="mt-4 border-t border-marketplace-border-subtle pt-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StarRatingDisplay
              rating={state.review.rating}
              size="sm"
              showValue
            />
            <span className="text-xs text-marketplace-muted-foreground">
              {t(`status_${state.review.status}`, {
                defaultValue: state.review.status,
              })}
            </span>
          </div>
          {detailRatings.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {detailRatings.map(({ label, rating }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs text-marketplace-muted-foreground"
                >
                  <span>{label}</span>
                  <StarRatingDisplay rating={rating} size="sm" />
                </li>
              ))}
            </ul>
          ) : null}
          {state.review.recommended != null ? (
            <p className="mt-2 text-xs text-marketplace-muted-foreground">
              {t("recommendPrompt")}{" "}
              {t(state.review.recommended ? "recommendYes" : "recommendNo")}
            </p>
          ) : null}
          {state.review.title ? (
            <p className="mt-2 text-sm font-semibold text-marketplace-foreground">
              {state.review.title}
            </p>
          ) : null}
          {state.review.body ? (
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm leading-5 text-marketplace-muted-foreground">
              {state.review.body}
            </p>
          ) : null}
          {state.review.images?.length || state.review.videos?.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {state.review.images?.map((image) => (
                <li key={image.id}>
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={image.filename}
                  >
                    <ProductImage
                      src={image.url}
                      alt={image.filename}
                      width={56}
                      height={56}
                      className="size-14 rounded-md border border-marketplace-border-subtle object-cover"
                    />
                  </a>
                </li>
              ))}
              {state.review.videos?.map((video) => (
                <li key={video.id}>
                  {/* biome-ignore lint/a11y/useMediaCaption: Review uploads do not include separate caption-track files. */}
                  <video
                    src={video.url}
                    controls
                    aria-label={video.filename}
                    className="h-14 w-24 rounded-md border border-marketplace-border-subtle bg-black object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
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
      </div>
      {open && target ? (
        <ReviewFormDialog target={target} onClose={() => setOpen(false)} />
      ) : null}
    </div>
  );
}
