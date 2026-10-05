"use client";

import type { Media } from "@spree/sdk";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_MAX_VERTICAL_PX = 75;

interface MediaLightboxProps {
  images: Media[];
  activeIndex: number;
  productName: string;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

function getFullImageUrl(media: Media | undefined): string | null {
  if (!media) return null;
  if (media.media_type === "video") return media.poster_url || null;
  if (media.media_type === "external_video") {
    return media.poster_url || media.xlarge_url || media.large_url || null;
  }
  return media.xlarge_url || media.large_url || media.original_url || null;
}

function getThumbImageUrl(media: Media | undefined): string | null {
  if (!media) return null;
  if (media.media_type === "video" || media.media_type === "external_video") {
    return media.poster_url || media.small_url || media.mini_url || null;
  }
  return media.small_url || media.mini_url || media.original_url || null;
}

/**
 * Fullscreen product media lightbox — portaled to document.body so `fixed`
 * is not trapped by transformed ancestors on the product page.
 * Light gallery layout: large centered stage, counter under the image,
 * thumbnail rail pinned to the bottom edge.
 */
export function MediaLightbox({
  images,
  activeIndex,
  productName,
  onClose,
  onNavigate,
}: MediaLightboxProps): React.ReactElement | null {
  const t = useTranslations("products");
  const current = images[activeIndex];
  const src = getFullImageUrl(current);
  const videoUrl = current?.media_type === "video" ? current.video_url : null;
  const embedUrl =
    current?.media_type === "external_video" ? current.video_embed_url : null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const goPrev = useCallback(() => {
    onNavigate(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  }, [activeIndex, images.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, images.length, onNavigate]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
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
      if (dx < 0) goNext();
      else goPrev();
    },
    [goNext, goPrev, images.length],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const currentIndex = activeIndex;
    if (currentIndex >= 0) {
      activeThumbRef.current?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  if (typeof document === "undefined") return null;
  if (!src && !videoUrl && !embedUrl) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("openImageZoom")}
      className="fixed inset-0 z-[100] bg-[#17131a] text-white touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex h-dvh w-full flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/90">
              {productName}
            </p>
            {images.length > 1 ? (
              <p className="mt-0.5 text-xs tabular-nums text-white/55">
                {activeIndex + 1}/{images.length}
              </p>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white/75 transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/18 hover:text-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17131a]"
            onClick={onClose}
            aria-label={t("lightboxClose")}
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-12 pb-3 sm:px-20">
          {images.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute top-1/2 left-2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white/75 backdrop-blur-sm transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/18 hover:text-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17131a] sm:left-5"
                onClick={goPrev}
                aria-label={t("lightboxPrev")}
              >
                <ChevronLeft className="size-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                className="absolute top-1/2 right-2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white/75 backdrop-blur-sm transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/18 hover:text-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17131a] sm:right-5"
                onClick={goNext}
                aria-label={t("lightboxNext")}
              >
                <ChevronRight className="size-5" strokeWidth={1.5} />
              </button>
            </>
          ) : null}

          <div className="relative aspect-square w-[min(100%,calc(100dvh-190px),760px)] rounded-lg bg-black/15 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:rounded-xl">
            {videoUrl ? (
              // biome-ignore lint/a11y/useMediaCaption: The Spree Media response has no separate caption-track URL; seller video files may include embedded captions.
              <video
                key={videoUrl}
                src={videoUrl}
                poster={current?.poster_url || undefined}
                className="absolute inset-0 size-full object-contain"
                controls
                autoPlay
                playsInline
              />
            ) : embedUrl ? (
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={current?.alt || productName}
                className="absolute inset-0 size-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : src ? (
              <Image
                src={src}
                alt={current?.alt || productName}
                fill
                className="pointer-events-none object-contain"
                sizes="(max-width: 768px) 100vw, 680px"
                priority
              />
            ) : null}
          </div>
        </div>

        {images.length > 1 ? (
          <div className="flex shrink-0 justify-center border-t border-white/10 bg-black/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-4">
            <ul
              className="flex max-w-[min(100%,calc(100vw-2rem))] list-none gap-2.5 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-[min(100%,calc(100vw-3rem))]"
              aria-label={t("galleryPagination", {
                current: activeIndex + 1,
                total: images.length,
              })}
            >
              {images.map((media, index) => {
                const thumbUrl = getThumbImageUrl(media);
                const isActive = index === activeIndex;
                const isVideo =
                  media.media_type === "video" ||
                  media.media_type === "external_video";
                return (
                  <li key={media.id}>
                    <button
                      ref={isActive ? activeThumbRef : undefined}
                      type="button"
                      onClick={() => onNavigate(index)}
                      aria-label={t("galleryPagination", {
                        current: index + 1,
                        total: images.length,
                      })}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "relative size-14 shrink-0 overflow-hidden rounded-md bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17131a] sm:size-16",
                        isActive
                          ? "outline outline-2 outline-white outline-offset-2"
                          : "opacity-65 transition-[opacity,transform] duration-150 ease-out hover:opacity-100 active:scale-[0.97]",
                      )}
                    >
                      {thumbUrl ? (
                        <Image
                          src={thumbUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                      {isVideo ? (
                        <span
                          className="absolute inset-0 grid place-items-center bg-black/35"
                          aria-hidden
                        >
                          <Play className="size-4 fill-white text-white" />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
