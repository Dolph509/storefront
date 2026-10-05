import type { ProductReview } from "@spree/sdk";
import { BadgeCheck, Check, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductImage } from "@/components/ui/product-image";
import { formatDateTime } from "@/lib/utils/format";
import { StarRatingDisplay } from "./StarRating";

interface ProductReviewCardProps {
  review: ProductReview;
  locale: string;
  showProductLink?: boolean;
  basePath?: string;
}

function ReviewMedia({
  images,
  videos,
}: {
  images: ProductReview["images"];
  videos: ProductReview["videos"];
}) {
  if (!images?.length && !videos?.length) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-2.5">
      {images?.map((image) => (
        <li key={image.id}>
          <a
            href={image.url}
            target="_blank"
            rel="noreferrer"
            aria-label={image.filename}
            className="block overflow-hidden rounded-md border border-marketplace-border-subtle bg-marketplace-surface-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketplace-brand focus-visible:ring-offset-2"
          >
            <ProductImage
              src={image.url}
              alt={image.filename}
              width={88}
              height={88}
              className="size-[5.5rem] object-cover"
            />
          </a>
        </li>
      ))}
      {videos?.map((video) => (
        <li key={video.id}>
          {/* biome-ignore lint/a11y/useMediaCaption: Review uploads do not include separate caption-track files. */}
          <video
            src={video.url}
            controls
            aria-label={video.filename}
            className="h-[5.5rem] w-36 rounded-md border border-marketplace-border-subtle bg-black object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

export async function ProductReviewCard({
  review,
  locale,
  showProductLink = false,
  basePath = "",
}: ProductReviewCardProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "reviews",
  });

  const displayDate = review.published_at ?? review.created_at;
  const reviewer = review.customer_name?.trim() || t("anonymousReviewer");
  const detailRatings = [
    { label: t("itemQualityRating"), value: review.item_quality_rating },
    { label: t("shippingRating"), value: review.shipping_rating },
    {
      label: t("customerServiceRating"),
      value: review.customer_service_rating,
    },
  ].filter(
    (item): item is { label: string; value: number } => item.value != null,
  );
  const initials = reviewer
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase(locale);

  return (
    <article className="min-w-0 rounded-lg border border-marketplace-border-subtle bg-marketplace-surface p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-marketplace-surface-warm text-sm font-semibold text-marketplace-brand"
          >
            {initials || "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-marketplace-foreground">
              {reviewer}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-marketplace-muted-foreground">
              <BadgeCheck
                className="size-3.5 text-marketplace-brand"
                aria-hidden="true"
              />
              {t("verifiedPurchase")}
            </p>
          </div>
        </div>
        <time
          dateTime={displayDate}
          className="whitespace-nowrap pt-1 text-xs text-marketplace-muted-foreground"
        >
          {formatDateTime(displayDate, locale)}
        </time>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <StarRatingDisplay rating={review.rating} size="sm" showValue />
        {review.recommended != null ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-marketplace-surface-warm px-2.5 py-1 text-xs font-medium text-marketplace-foreground">
            {review.recommended ? (
              <Check
                aria-hidden="true"
                className="size-3.5 text-marketplace-brand"
              />
            ) : (
              <ThumbsDown
                aria-hidden="true"
                className="size-3.5 text-marketplace-muted-foreground"
              />
            )}
            {t("recommendPrompt")}{" "}
            {t(review.recommended ? "recommendYes" : "recommendNo")}
          </span>
        ) : null}
      </div>

      {review.title ? (
        <h3 className="mt-3 text-base font-semibold leading-snug text-marketplace-foreground">
          {review.title}
        </h3>
      ) : null}

      {review.body ? (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-marketplace-foreground/90">
          {review.body}
        </p>
      ) : null}

      {detailRatings.length > 0 ? (
        <ul className="mt-4 grid gap-2 rounded-md bg-marketplace-surface-warm/60 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4">
          {detailRatings.map(({ label, value }) => (
            <li key={label} className="min-w-0">
              <p className="text-xs font-medium text-marketplace-muted-foreground">
                {label}
              </p>
              <div className="mt-1">
                <StarRatingDisplay rating={value} size="sm" showValue />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {showProductLink && review.product_name && review.product_slug ? (
        <p className="mt-4 text-xs text-marketplace-muted-foreground">
          {t("productFallback")}:{" "}
          <Link
            href={`${basePath}/products/${review.product_slug}`}
            className="font-medium text-marketplace-brand underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketplace-brand"
          >
            {review.product_name}
          </Link>
        </p>
      ) : null}

      <ReviewMedia images={review.images} videos={review.videos} />

      {review.seller_reply ? (
        <aside className="mt-5 border-l-2 border-marketplace-brand/35 bg-marketplace-surface-warm/55 px-4 py-3.5">
          <p className="text-xs font-semibold text-marketplace-brand">
            {t("sellerResponse")}
            {review.seller_replied_at ? (
              <time
                dateTime={review.seller_replied_at}
                className="font-normal text-marketplace-muted-foreground"
              >
                {" "}
                · {formatDateTime(review.seller_replied_at, locale)}
              </time>
            ) : null}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-marketplace-foreground">
            {review.seller_reply}
          </p>
          <ReviewMedia
            images={review.seller_reply_images}
            videos={review.seller_reply_videos}
          />
        </aside>
      ) : null}
    </article>
  );
}
