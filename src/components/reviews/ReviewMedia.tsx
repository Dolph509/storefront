"use client";

import type { ProductReview } from "@spree/sdk";
import { Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { flattenReviewMedia } from "./review-media-items";

const LazyReviewMediaLightbox = dynamic(
  () =>
    import("@/components/reviews/ReviewMediaLightbox").then((mod) => ({
      default: mod.ReviewMediaLightbox,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[100] bg-[#17131a]" aria-hidden="true" />
    ),
  },
);

interface ReviewMediaProps {
  images: ProductReview["images"];
  videos: ProductReview["videos"];
}

export function ReviewMedia({ images, videos }: ReviewMediaProps) {
  const t = useTranslations("products");
  const items = useMemo(
    () => flattenReviewMedia(images, videos),
    [images, videos],
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => openLightbox(index)}
              aria-label={t("openImageZoom")}
              className="relative block overflow-hidden rounded-md border border-[#e1e3df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketplace-brand"
            >
              {item.kind === "image" ? (
                <ProductImage
                  src={item.url}
                  alt={item.filename}
                  width={72}
                  height={72}
                  className="size-[4.5rem] object-cover"
                />
              ) : (
                <span
                  className="flex h-[4.5rem] w-32 items-center justify-center bg-[#222]"
                  aria-hidden
                >
                  <Play className="size-8 fill-white/90 text-white/90" />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {lightboxIndex !== null ? (
        <LazyReviewMediaLightbox
          items={items}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
