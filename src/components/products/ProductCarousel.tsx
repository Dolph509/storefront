"use client";

import type { Product } from "@spree/sdk";
import type { ReactElement } from "react";
import { useCallback, useRef, useState } from "react";
import type Swiper from "swiper";
import { Navigation } from "swiper/modules";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/products/ProductCard";

interface ProductCarouselProps {
  products: Product[];
  basePath: string;
  /** Optional currency used for analytics in each ProductCard. */
  currency?: string;
  listId?: string;
  listName?: string;
  variant?: "default" | "etsy";
}

const NAV_BUTTON_BASE =
  "absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center cursor-pointer rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors";

const NAV_BUTTON_ETSY =
  "absolute top-[42%] z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#222] text-white shadow-md transition hover:bg-black disabled:pointer-events-none disabled:opacity-0";

export function ProductCarousel({
  products,
  basePath,
  currency,
  listId = "featured-products",
  listName = "Featured Products",
  variant = "default",
}: ProductCarouselProps): ReactElement {
  const t = useTranslations("products");
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const handleBeforeInit = useCallback((swiper: Swiper) => {
    if (typeof swiper.params.navigation === "object") {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
    }
  }, []);

  const updateNavState = useCallback((swiper: Swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("noProductsFound")}</p>
      </div>
    );
  }

  const isEtsy = variant === "etsy";
  const navClass = isEtsy ? NAV_BUTTON_ETSY : NAV_BUTTON_BASE;
  const cardDensity = isEtsy ? "rail" : "standard";

  return (
    <div className="relative">
      <button
        ref={prevRef}
        type="button"
        aria-label={t("carouselPrev")}
        disabled={isBeginning}
        className={`${navClass} ${isEtsy ? "left-0" : "-left-5"} ${isBeginning ? "opacity-0" : ""}`}
      >
        <ChevronLeft className={isEtsy ? "size-5" : "w-5 h-5"} />
      </button>
      <button
        ref={nextRef}
        type="button"
        aria-label={t("carouselNext")}
        disabled={isEnd}
        className={`${navClass} ${isEtsy ? "right-0" : "-right-5"} ${isEnd ? "opacity-0" : ""}`}
      >
        <ChevronRight className={isEtsy ? "size-5" : "w-5 h-5"} />
      </button>
      <SwiperComponent
        modules={[Navigation]}
        spaceBetween={isEtsy ? 12 : 24}
        slidesPerView={isEtsy ? 2.15 : 1}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={handleBeforeInit}
        onSlideChange={updateNavState}
        onReachBeginning={updateNavState}
        onReachEnd={updateNavState}
        onAfterInit={updateNavState}
        breakpoints={
          isEtsy
            ? {
                640: { slidesPerView: 3.25, spaceBetween: 12 },
                768: { slidesPerView: 4.25, spaceBetween: 14 },
                1024: { slidesPerView: 5.5, spaceBetween: 14 },
                1280: { slidesPerView: 6.25, spaceBetween: 14 },
              }
            : {
                640: { slidesPerView: 2, spaceBetween: 24 },
                768: { slidesPerView: 3, spaceBetween: 24 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }
        }
        className="product-carousel"
      >
        {products.map((product, index) => (
          <SwiperSlide key={product.id} className={isEtsy ? "" : "p-1"}>
            <ProductCard
              product={product}
              basePath={basePath}
              index={index}
              listId={listId}
              listName={listName}
              currency={currency}
              fetchPriority={index === 0 ? "high" : undefined}
              density={cardDensity}
              showFavorite={!isEtsy}
            />
          </SwiperSlide>
        ))}
      </SwiperComponent>
    </div>
  );
}
