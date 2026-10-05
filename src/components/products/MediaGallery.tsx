"use client";

import type { Media } from "@spree/sdk";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_MAX_VERTICAL_PX = 75;

/** Tiny 10×10 neutral gray PNG used as a blur placeholder while images load. */
const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIElEQVQYV2P4////MwwMDAxMDAwMDGQJMJCvkGwNZCsEAGebBwVss9lRAAAAAElFTkSuQmCC";

/** Lazy-loaded lightbox — only pulled into the bundle when a user zooms. */
const LazyMediaLightbox = dynamic(
  () =>
    import("@/components/products/MediaLightbox").then((mod) => ({
      default: mod.MediaLightbox,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-[#fafafa]" aria-hidden="true" />
    ),
  },
);

interface MediaGalleryProps {
  images: Media[];
  productName: string;
  productId?: string;
  variantId?: string | null;
  activeIndex?: number | null;
  thumbnailPosition?: "bottom" | "left";
  imageRatio?: "square" | "portrait";
}

/** Prefer pre-sized Spree media URLs over the full-resolution original,
 * so the Next.js image optimizer doesn't have to fetch the source file. */
function getMainImageUrl(media: Media | undefined): string | null {
  if (!media) return null;
  if (media.media_type === "video") return media.poster_url || null;
  if (media.media_type === "external_video")
    return media.poster_url || media.xlarge_url || media.large_url || null;
  return media.xlarge_url || media.large_url || media.original_url || null;
}

function getThumbImageUrl(media: Media | undefined): string | null {
  if (!media) return null;
  if (media.media_type === "video") return media.poster_url || null;
  return media.small_url || media.mini_url || media.original_url || null;
}

export function MediaGallery(props: MediaGalleryProps) {
  // Reset internal state when the parent changes activeIndex by rekeying.
  // Avoids the useEffect-to-sync-prop antipattern.
  return <MediaGalleryInner key={props.activeIndex ?? "default"} {...props} />;
}

function MediaGalleryInner({
  images,
  productName,
  productId,
  variantId,
  activeIndex,
  thumbnailPosition = "bottom",
  imageRatio = "square",
}: MediaGalleryProps) {
  const t = useTranslations("products");
  const [selectedIndex, setSelectedIndex] = useState(activeIndex ?? 0);
  const [isZoomed, setIsZoomed] = useState(false);

  const safeIndex = Math.max(0, Math.min(selectedIndex, images.length - 1));

  // Horizontal swipe on the main image navigates between media. When a
  // swipe is detected we suppress the synthetic click so the lightbox
  // doesn't open from the same gesture.
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    suppressClickRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || images.length <= 1) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (
        Math.abs(dx) < SWIPE_THRESHOLD_PX ||
        Math.abs(dy) > SWIPE_MAX_VERTICAL_PX
      ) {
        return;
      }
      suppressClickRef.current = true;
      const nextIndex =
        dx < 0
          ? (safeIndex + 1) % images.length
          : (safeIndex - 1 + images.length) % images.length;
      setSelectedIndex(nextIndex);
    },
    [images.length, safeIndex],
  );

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-xl bg-marketplace-surface-subtle">
        <ProductImage
          src={null}
          alt={productName}
          fill
          iconClassName="w-24 h-24"
        />
        {productId ? (
          <FavoriteButton productId={productId} variantId={variantId} overlay />
        ) : null}
      </div>
    );
  }

  const selectImage = (index: number) => {
    setSelectedIndex(index);
  };

  const selectedImage = images[safeIndex];
  const mainImageUrl = getMainImageUrl(selectedImage);
  const leftThumbnails = thumbnailPosition === "left";
  const collage = !leftThumbnails;

  // Collage: hero + up to two supporting tiles (next media after the hero).
  // Left-rail: carousel strip of up to five thumbs including the current one.
  const thumbnailIndices = leftThumbnails
    ? Array.from(
        { length: Math.min(images.length, 5) },
        (_, offset) => (safeIndex + offset) % images.length,
      )
    : images
        .map((_, index) => index)
        .filter((index) => index !== safeIndex)
        .slice(0, 2);

  const showMainImage = Boolean(
    mainImageUrl || selectedImage?.video_url || selectedImage?.video_embed_url,
  );
  const showViewAll =
    collage && images.length > 1 && thumbnailIndices.length > 0;

  const openLightbox = (index: number) => {
    selectImage(index);
    setIsZoomed(true);
  };

  const goToPrevious = () => {
    if (images.length <= 1) return;
    setSelectedIndex((safeIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    if (images.length <= 1) return;
    setSelectedIndex((safeIndex + 1) % images.length);
  };

  const heroAspect = collage
    ? "aspect-square"
    : imageRatio === "portrait"
      ? "aspect-[4/5]"
      : "aspect-square";

  return (
    <div
      className={cn(
        collage ? "space-y-2" : "space-y-2 sm:space-y-2.5",
        leftThumbnails &&
          "lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)] lg:items-start lg:gap-3 lg:space-y-0",
      )}
    >
      <div className={cn("relative", leftThumbnails && "lg:order-2")}>
        <GalleryMediaButton
          media={selectedImage}
          src={mainImageUrl}
          alt={selectedImage?.alt || productName}
          ariaLabel={t("galleryPagination", {
            current: safeIndex + 1,
            total: images.length,
          })}
          priority
          className={cn(heroAspect, "w-full rounded-xl")}
          onClick={() => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }
            if (showMainImage) openLightbox(safeIndex);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        {leftThumbnails && images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label={t("galleryPagination", {
                current: ((safeIndex - 1 + images.length) % images.length) + 1,
                total: images.length,
              })}
              className="absolute top-1/2 left-3 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-marketplace-border/60 bg-white/95 text-marketplace-foreground shadow-sm transition-transform hover:bg-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2 sm:left-4 sm:size-10"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label={t("galleryPagination", {
                current: ((safeIndex + 1) % images.length) + 1,
                total: images.length,
              })}
              className="absolute top-1/2 right-3 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-marketplace-border/60 bg-white/95 text-marketplace-foreground shadow-sm transition-transform hover:bg-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2 sm:right-4 sm:size-10"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
        {productId ? (
          <FavoriteButton
            productId={productId}
            variantId={variantId}
            overlay
            className="active:scale-[0.97]"
          />
        ) : null}
      </div>

      {thumbnailIndices.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-2 gap-2",
            leftThumbnails && "lg:order-1 lg:grid-cols-1 lg:gap-2",
          )}
        >
          {thumbnailIndices.map((index, tileIndex) => {
            const media = images[index];
            const lastTile = tileIndex === thumbnailIndices.length - 1;
            const thumbUrl = getThumbImageUrl(media);
            return (
              <div key={`${media.id}-${index}`} className="relative min-w-0">
                <GalleryMediaButton
                  media={media}
                  src={thumbUrl}
                  alt={media.alt || `${productName} ${index + 1}`}
                  ariaLabel={t("galleryPagination", {
                    current: index + 1,
                    total: images.length,
                  })}
                  className={cn(
                    "w-full rounded-xl",
                    collage && thumbnailIndices.length === 1
                      ? "aspect-[2/1]"
                      : "aspect-square",
                    leftThumbnails && index === safeIndex
                      ? "ring-2 ring-[#222] ring-offset-1"
                      : leftThumbnails
                        ? "ring-1 ring-marketplace-border/70"
                        : "",
                  )}
                  onClick={() =>
                    collage ? openLightbox(index) : selectImage(index)
                  }
                />
                {lastTile &&
                (showViewAll || (leftThumbnails && images.length > 5)) ? (
                  <button
                    type="button"
                    onClick={() => openLightbox(0)}
                    className={cn(
                      "absolute inline-flex items-center justify-center rounded-full border border-black/10 bg-white font-medium text-[#222] shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2",
                      leftThumbnails
                        ? "inset-x-1 bottom-1 min-h-7 px-1 text-xs"
                        : "right-2.5 bottom-2.5 min-h-9 gap-1.5 px-3.5 text-sm sm:right-3 sm:bottom-3 sm:min-h-10 sm:px-4",
                    )}
                  >
                    {t("viewAllPhotos", { count: images.length })}
                    {collage ? (
                      <ArrowRight aria-hidden className="size-3.5" />
                    ) : null}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {isZoomed && showMainImage ? (
        <LazyMediaLightbox
          images={images}
          activeIndex={safeIndex}
          productName={productName}
          onClose={() => setIsZoomed(false)}
          onNavigate={selectImage}
        />
      ) : null}
    </div>
  );
}

interface GalleryMediaButtonProps {
  media: Media | undefined;
  src: string | null;
  alt: string;
  ariaLabel: string;
  className: string;
  onClick: () => void;
  priority?: boolean;
  onTouchStart?: (event: React.TouchEvent<HTMLButtonElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLButtonElement>) => void;
}

function GalleryMediaButton({
  media,
  src,
  alt,
  ariaLabel,
  className,
  onClick,
  priority = false,
  onTouchStart,
  onTouchEnd,
}: GalleryMediaButtonProps) {
  const isVideo =
    media?.media_type === "video" || media?.media_type === "external_video";
  const canOpen = Boolean(src || media?.video_url || media?.video_embed_url);

  return (
    <button
      type="button"
      className={cn(
        "group relative block touch-pan-y cursor-zoom-in overflow-hidden bg-marketplace-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketplace-brand focus-visible:ring-inset",
        className,
      )}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={ariaLabel}
      disabled={!canOpen}
    >
      <ProductImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        quality={85}
        sizes={
          priority
            ? "(max-width: 768px) 100vw, 50vw"
            : "(max-width: 768px) 50vw, 25vw"
        }
        placeholder={priority ? "blur" : "empty"}
        blurDataURL={priority ? BLUR_PLACEHOLDER : undefined}
        iconClassName="w-24 h-24"
      />
      {isVideo ? (
        <span className="absolute inset-0 grid place-items-center" aria-hidden>
          <span className="grid size-12 place-items-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-[2px] sm:size-14">
            <Play className="ml-0.5 size-5 fill-current sm:size-6" />
          </span>
        </span>
      ) : null}
    </button>
  );
}
