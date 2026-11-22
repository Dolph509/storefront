"use client";

import type { Media } from "@spree/sdk";
import { ImageIcon, Maximize2, Play, Share } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/utils";

const LazyMediaLightbox = dynamic(
  () =>
    import("@/components/products/MediaLightbox").then((mod) => ({
      default: mod.MediaLightbox,
    })),
  { ssr: false },
);

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

type OddkeepsReferenceGalleryProps = {
  images: Media[];
  productName: string;
  productId: string;
  variantId?: string | null;
  activeIndex?: number | null;
  onShare?: () => void;
};

export function OddkeepsReferenceGallery(props: OddkeepsReferenceGalleryProps) {
  return (
    <OddkeepsReferenceGalleryInner
      key={props.activeIndex ?? "default"}
      {...props}
    />
  );
}

function OddkeepsReferenceGalleryInner({
  images,
  productName,
  productId,
  variantId,
  activeIndex,
  onShare,
}: OddkeepsReferenceGalleryProps) {
  const t = useTranslations("products");
  const initialIndex =
    activeIndex != null && activeIndex >= 0 && activeIndex < images.length
      ? activeIndex
      : 0;
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const safeIndex =
    selectedIndex >= 0 && selectedIndex < images.length ? selectedIndex : 0;
  const activeMedia = images[safeIndex];
  const mainUrl = getMainImageUrl(activeMedia);
  const visibleThumbs = images.slice(0, 4);

  const handleTouchStart = (event: React.TouchEvent) => {
    if (images.length <= 1) return;
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (images.length <= 1 || touchStartX.current == null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX == null) return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) {
      setSelectedIndex((safeIndex + 1) % images.length);
    } else {
      setSelectedIndex((safeIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div data-pdp-media-gallery className="w-full">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-square w-full overflow-hidden rounded-none bg-[#f4f2ee] md:rounded-[10px]"
      >
        {mainUrl ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block size-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
            aria-label={t("openImageZoom")}
          >
            <ProductImage
              src={mainUrl}
              alt={activeMedia?.alt || productName}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 56vw"
              className="object-cover"
            />
          </button>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-[#8d8882]">
            <ImageIcon className="size-10 stroke-[1.35]" aria-hidden />
            <span className="text-sm">{t("noImageAvailable")}</span>
          </div>
        )}

        <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-3.5 sm:top-3.5">
          {onShare ? (
            <button
              type="button"
              onClick={onShare}
              aria-label={t("shareProduct")}
              className="pointer-events-auto grid size-10 place-items-center rounded-full border border-black/5 bg-white/95 text-[#1a1a1a] shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332] md:hidden"
            >
              <Share className="size-[18px]" aria-hidden />
            </button>
          ) : null}
          <div className="pointer-events-auto [&_button]:static [&_button]:size-10 [&_button]:rounded-full [&_button]:border [&_button]:border-black/5 [&_button]:bg-white/95 [&_button]:shadow-sm md:[&_button]:size-9">
            <FavoriteButton
              productId={productId}
              variantId={variantId}
              overlay
            />
          </div>
          {images.length > 0 ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={t("openImageZoom")}
              className="pointer-events-auto hidden size-9 place-items-center rounded-full border border-black/5 bg-white/95 text-[#1a1a1a] shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332] md:grid"
            >
              <Maximize2 className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-2 md:hidden">
          {images.slice(0, 10).map((media, index) => (
            <button
              key={media.id || index}
              type="button"
              aria-current={index === safeIndex ? "true" : undefined}
              aria-label={t("galleryPagination", {
                current: index + 1,
                total: images.length,
              })}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "size-2 rounded-full transition-colors",
                index === safeIndex ? "bg-[#1a1a1a]" : "bg-[#d4d1cc]",
              )}
            />
          ))}
        </div>
      ) : null}

      {visibleThumbs.length > 1 ? (
        <div className="mt-3 hidden grid-cols-4 gap-3 md:grid">
          {visibleThumbs.map((media, index) => {
            const thumbUrl = getThumbImageUrl(media);
            const selected = index === safeIndex;
            const isVideo =
              media.media_type === "video" ||
              media.media_type === "external_video";
            return (
              <button
                key={media.id || index}
                type="button"
                aria-current={selected ? "true" : undefined}
                aria-label={t("galleryPagination", {
                  current: index + 1,
                  total: images.length,
                })}
                onClick={() => setSelectedIndex(index)}
                className="group relative flex flex-col focus-visible:outline-none"
              >
                <span className="relative aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-[#f4f2ee]">
                  {thumbUrl ? (
                    <ProductImage
                      src={thumbUrl}
                      alt={media.alt || `${productName} ${index + 1}`}
                      fill
                      sizes="150px"
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  {isVideo ? (
                    <span className="absolute inset-0 grid place-items-center bg-black/20 text-white">
                      <Play className="size-4 fill-current" aria-hidden />
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-1.5 h-[2px] w-full rounded-full transition-colors",
                    selected
                      ? "bg-[#1b4332]"
                      : "bg-transparent group-hover:bg-[#d4d1cc]",
                  )}
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {lightboxOpen && images.length > 0 ? (
        <LazyMediaLightbox
          images={images}
          productName={productName}
          activeIndex={safeIndex}
          onNavigate={setSelectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </div>
  );
}
