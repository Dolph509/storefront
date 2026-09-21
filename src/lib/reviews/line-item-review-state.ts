import type { Order, ProductReview, ReviewablePurchase } from "@spree/sdk";
import { lineItemDeliveredAt } from "./order-delivered-at";

export type LineItemReviewState =
  | { kind: "write"; purchase: ReviewablePurchase }
  | { kind: "view"; review: ProductReview; editable: boolean }
  | { kind: "none" };

export function reviewByLineItemId(
  reviews: ProductReview[],
): Map<string, ProductReview> {
  const map = new Map<string, ProductReview>();
  for (const review of reviews) {
    map.set(review.line_item_id, review);
  }
  return map;
}

export function reviewableByLineItemId(
  purchases: ReviewablePurchase[],
): Map<string, ReviewablePurchase> {
  const map = new Map<string, ReviewablePurchase>();
  for (const purchase of purchases) {
    map.set(purchase.line_item_id, purchase);
  }
  return map;
}

/** Infer store review window length from reviewable rows (same store policy for all). */
export function inferReviewWindowDays(
  purchases: ReviewablePurchase[],
): number | null {
  for (const purchase of purchases) {
    if (!purchase.delivered_at || !purchase.review_window_closes_at) {
      if (purchase.delivered_at && !purchase.review_window_closes_at) {
        return 0;
      }
      continue;
    }
    const opened = Date.parse(purchase.delivered_at);
    const closes = Date.parse(purchase.review_window_closes_at);
    if (Number.isNaN(opened) || Number.isNaN(closes)) continue;
    const days = Math.round((closes - opened) / (24 * 60 * 60 * 1000));
    return days > 0 ? days : 0;
  }
  return null;
}

export function isReviewWindowOpen(
  deliveredAt: string | null | undefined,
  windowDays: number | null,
  now = Date.now(),
): boolean {
  if (!deliveredAt) return false;
  if (windowDays === 0) return true;
  if (windowDays == null) return true;
  const opened = Date.parse(deliveredAt);
  if (Number.isNaN(opened)) return false;
  const closes = opened + windowDays * 24 * 60 * 60 * 1000;
  return now <= closes;
}

export function canEditExistingReview(
  review: ProductReview,
  deliveredAt: string | null | undefined,
  windowDays: number | null,
): boolean {
  if (review.status === "rejected" || review.status === "hidden") {
    return false;
  }
  return isReviewWindowOpen(deliveredAt, windowDays);
}

export function lineItemReviewState(
  lineItemId: string,
  purchases: ReviewablePurchase[],
  reviews: ProductReview[],
  deliveredAt?: string | null,
  windowDays?: number | null,
): LineItemReviewState {
  const purchase = reviewableByLineItemId(purchases).get(lineItemId);
  if (purchase) {
    return { kind: "write", purchase };
  }

  const review = reviewByLineItemId(reviews).get(lineItemId);
  if (review) {
    const days = windowDays ?? inferReviewWindowDays(purchases);
    const editable = canEditExistingReview(review, deliveredAt, days);
    return { kind: "view", review, editable };
  }

  return { kind: "none" };
}

export function buildLineItemReviewStates(
  order: Order,
  purchases: ReviewablePurchase[],
  reviews: ProductReview[],
): Map<string, LineItemReviewState> {
  const windowDays = inferReviewWindowDays(purchases);
  const map = new Map<string, LineItemReviewState>();
  for (const item of order.items ?? []) {
    const deliveredAt = lineItemDeliveredAt(order, item.id);
    map.set(
      item.id,
      lineItemReviewState(item.id, purchases, reviews, deliveredAt, windowDays),
    );
  }
  return map;
}
