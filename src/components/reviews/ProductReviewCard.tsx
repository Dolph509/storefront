import type { ProductReview } from "@spree/sdk";
import { ProductReviewCardView } from "./ProductReviewCardView";

interface ProductReviewCardProps {
  review: ProductReview;
  locale: string;
  showProductLink?: boolean;
  basePath?: string;
}

/** Full review card for account and other server-rendered lists. */
export function ProductReviewCard({
  review,
  locale: _locale,
  showProductLink,
  basePath,
}: ProductReviewCardProps) {
  return (
    <ProductReviewCardView
      review={review}
      showProductLink={showProductLink}
      basePath={basePath}
    />
  );
}
