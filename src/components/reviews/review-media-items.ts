import type { ProductReview } from "@spree/sdk";

export type ReviewAttachment = ProductReview["images"][number];

export type ReviewMediaItem = ReviewAttachment & {
  kind: "image" | "video";
};

export function flattenReviewMedia(
  images: ProductReview["images"] | undefined | null,
  videos: ProductReview["videos"] | undefined | null,
): ReviewMediaItem[] {
  const items: ReviewMediaItem[] = [];
  for (const image of images ?? []) {
    items.push({ ...image, kind: "image" });
  }
  for (const video of videos ?? []) {
    items.push({ ...video, kind: "video" });
  }
  return items;
}
