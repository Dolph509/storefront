"use client";

import type { Media } from "@spree/sdk";
import { ArrowRight, Play } from "lucide-react";
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
    // Minimal fullscreen overlay so the zoom click gives immediate
    // feedback on slow networks while the chunk downloads.
    loading: () => (
      <div className="fixed inset-0 z-50 bg-black/90" aria-hidden="true" />
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
      <div className="relative aspect-square overflow-hidden rounded-[var(--marketplace-radius-lg)] bg-marketplace-surface-subtle shadow-[var(--marketplace-shadow-card)]">
        <ProductImage
          src={null}
          alt={productName}
          fill
          iconClassName="w-24 h-24"
        />
      </div>
    );
  }

  const selectImage = (index: number) => {
    setSelectedIndex(index);
  };

  const selectedImage = images[safeIndex];
  const mainImageUrl = getMainImageUrl(selectedImage);
  const leftThumbnails = thumbnailPosition === "left";
  const visibleIndices = leftThumbnails
    ? Array.from(
        { length: Math.min(images.length, 5) },
        (_, offset) => (safeIndex + offset) % images.length,
      )
    : images.length > 2
      ? [
          safeIndex,
          (safeIndex + 1) % images.length,
          (safeIndex + 2) % images.length,
        ]
      : images.length === 2
        ? [safeIndex, (safeIndex + 1) % images.length]
        : [safeIndex];
  const thumbnailIndices =
    leftThumbnails && images.length > 1
      ? visibleIndices
      : leftThumbnails
        ? []
        : visibleIndices.slice(1);
  const showMainImage = Boolean(
    mainImageUrl || selectedImage?.video_url || selectedImage?.video_embed_url,
  );

  const openLightbox = (index: number) => {
    selectImage(index);
    setIsZoomed(true);
  };

  return (
    <div
      className={cn(
        "space-y-2 sm:space-y-2.5",
        leftThumbnails &&
          "lg:grid lg:grid-cols-[5.25rem_minmax(0,1fr)] lg:items-start lg:gap-3 lg:space-y-0",
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
          className={`${imageRatio === "portrait" ? "aspect-[4/5]" : "aspect-square"} w-full rounded-[var(--marketplace-radius-md)]`}
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
        {productId ? (
          <FavoriteButton
            productId={productId}
            variantId={variantId}
            className="absolute right-3 top-3 z-10 size-12 border border-marketplace-border/50 bg-white shadow-sm active:scale-[0.97] sm:right-4 sm:top-4"
          />
        ) : null}
      </div>

      {thumbnailIndices.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-2 gap-2 sm:gap-2.5",
            leftThumbnails && "lg:order-1 lg:grid-cols-1",
          )}
        >
          {thumbnailIndices.map((index, tileIndex) => {
            const media = images[index];
            const lastTile = tileIndex === thumbnailIndices.length - 1;
            const thumbUrl = getThumbImageUrl(media);
            return (
              <div key={media.id} className="relative min-w-0">
                <GalleryMediaButton
                  media={media}
                  src={thumbUrl}
                  alt={media.alt || `${productName} ${index + 1}`}
                  ariaLabel={t("galleryPagination", {
                    current: index + 1,
                    total: images.length,
                  })}
                  className={`${images.length === 2 && !leftThumbnails ? "col-span-2 aspect-[2/1]" : leftThumbnails ? "aspect-[4/3]" : "aspect-square"} w-full rounded-[var(--marketplace-radius-md)] ${index === safeIndex ? "ring-2 ring-marketplace-brand ring-offset-2" : ""}`}
                  onClick={() => selectImage(index)}
                />
                {lastTile && images.length > (leftThumbnails ? 5 : 3) ? (
                  <button
                    type="button"
                    onClick={() => openLightbox(safeIndex)}
                    className={cn(
                      "absolute inline-flex items-center justify-center rounded-full border border-marketplace-border/60 bg-white text-xs font-medium text-marketplace-foreground shadow-sm transition-colors hover:bg-marketplace-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketplace-brand focus-visible:ring-offset-2",
                      leftThumbnails
                        ? "inset-x-1 bottom-1 min-h-7"
                        : "bottom-2 right-2 min-h-9 gap-1.5 px-3 sm:bottom-3 sm:right-3 sm:min-h-10 sm:px-4 sm:text-sm",
                    )}
                  >
                    {t("viewAllPhotos", { count: images.length })}
                    {!leftThumbnails ? (
                      <ArrowRight aria-hidden className="size-3.5" />
                    ) : null}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Lightbox (lazy) */}
      {isZoomed && showMainImage && (
        <LazyMediaLightbox
          images={images}
          activeIndex={safeIndex}
          productName={productName}
          onClose={() => setIsZoomed(false)}
          onNavigate={selectImage}
        />
      )}
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
        "group relative block touch-pan-y cursor-zoom-in overflow-hidden bg-marketplace-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-marketplace-brand",
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
