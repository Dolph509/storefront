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
import {
  marketplaceProductHrefForProduct,
  type SellerShopListId,
  sellerShopProductHrefForProduct,
} from "@/lib/discovery-context";

interface ProductCarouselProps {
  products: Product[];
  basePath: string;
  /** Optional currency used for analytics in each ProductCard. */
  currency?: string;
  listId?: string;
  listName?: string;
  variant?: "default" | "etsy";
  spaceBetween?: number;
  sellerShopDiscovery?: {
    sellerId: string;
    listId: SellerShopListId;
    section?: string;
  };
  /** Homepage / marketplace recommendation rail section key for attribution. */
  homeRailSection?: string;
}

const NAV_BUTTON_BASE =
  "absolute top-1/2 z-20 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[var(--marketplace-radius-md)] border border-marketplace-border bg-marketplace-surface text-marketplace-muted-foreground shadow-[var(--marketplace-shadow-card)] transition hover:bg-marketplace-canvas hover:text-marketplace-foreground disabled:cursor-default disabled:opacity-35";

const NAV_BUTTON_ETSY =
  "absolute top-[36%] z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#222] text-white shadow-lg transition-[background-color,box-shadow,opacity] duration-200 ease-out hover:bg-black disabled:cursor-default motion-reduce:transition-none";

export function ProductCarousel({
  products,
  basePath,
  currency,
  listId = "featured-products",
  listName = "Featured Products",
  variant = "default",
  spaceBetween,
  sellerShopDiscovery,
  homeRailSection,
}: ProductCarouselProps): ReactElement {
  const t = useTranslations("products");
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(products.length > 1);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const updateNavState = useCallback((swiper: Swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
    const snapCount = swiper.snapGrid?.length ?? 0;
    setHasOverflow(!swiper.isLocked && snapCount > 1);
  }, []);

  const handleBeforeInit = useCallback((swiper: Swiper) => {
    if (typeof swiper.params.navigation === "object") {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
    }
  }, []);

  const handleSwiper = useCallback(
    (swiper: Swiper) => {
      swiper.navigation.init();
      swiper.navigation.update();
      updateNavState(swiper);
    },
    [updateNavState],
  );

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
  const showPrev = hasOverflow && !isBeginning;
  const showNext = hasOverflow && !isEnd;

  return (
    <div data-theme-carousel-navigation className="relative min-w-0 w-full">
      {!isEtsy && (
        <button
          ref={prevRef}
          type="button"
          aria-label={t("carouselPrev")}
          aria-hidden={!showPrev}
          tabIndex={showPrev ? 0 : -1}
          disabled={!showPrev}
          className={`${navClass} left-0 sm:-left-5 ${showPrev ? "" : "pointer-events-none !opacity-0"}`}
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {isEtsy && (
        <button
          ref={prevRef}
          type="button"
          aria-label={t("carouselPrev")}
          aria-hidden={!showPrev}
          tabIndex={showPrev ? 0 : -1}
          disabled={!showPrev}
          className={`${navClass} left-1 sm:left-2 ${showPrev ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <button
        ref={nextRef}
        type="button"
        aria-label={t("carouselNext")}
        aria-hidden={!showNext}
        tabIndex={showNext ? 0 : -1}
        disabled={!showNext}
        className={`${navClass} ${isEtsy ? "right-1 sm:right-2" : "right-0 sm:-right-5"} ${showNext ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <ChevronRight className="size-5" />
      </button>
      <div className="min-w-0 overflow-hidden">
        <SwiperComponent
          modules={[Navigation]}
          watchOverflow={false}
          spaceBetween={spaceBetween ?? (isEtsy ? 12 : 24)}
          slidesPerView={isEtsy ? 2.2 : 1}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={handleBeforeInit}
          onSwiper={handleSwiper}
          onSlideChange={updateNavState}
          onReachBeginning={updateNavState}
          onReachEnd={updateNavState}
          onAfterInit={updateNavState}
          onResize={updateNavState}
          onBreakpoint={updateNavState}
          onUpdate={updateNavState}
          breakpoints={
            isEtsy
              ? {
                  640: { slidesPerView: 3.15, spaceBetween: 12 },
                  768: { slidesPerView: 4.1, spaceBetween: 12 },
                  1024: { slidesPerView: 5.15, spaceBetween: 12 },
                  1280: { slidesPerView: 5.85, spaceBetween: 12 },
                }
              : {
                  640: { slidesPerView: 2, spaceBetween: 24 },
                  768: { slidesPerView: 3, spaceBetween: 24 },
                  1024: { slidesPerView: 4, spaceBetween: 24 },
                }
          }
          className="product-carousel !w-full max-w-full"
        >
          {products.map((product, index) => (
            <SwiperSlide key={product.id} className={isEtsy ? "" : "p-1"}>
              <ProductCard
                product={product}
                href={
                  sellerShopDiscovery
                    ? sellerShopProductHrefForProduct(basePath, product, {
                        sellerId: sellerShopDiscovery.sellerId,
                        listId: sellerShopDiscovery.listId,
                        position: index,
                        section: sellerShopDiscovery.section,
                      })
                    : listId.startsWith("recommendation-")
                      ? marketplaceProductHrefForProduct(basePath, product, {
                          listId,
                          position: index,
                          section: homeRailSection,
                        })
                      : undefined
                }
                basePath={basePath}
                index={index}
                listId={listId}
                listName={listName}
                currency={currency}
                fetchPriority={index === 0 ? "high" : undefined}
                density={cardDensity}
                showFavorite
              />
            </SwiperSlide>
          ))}
        </SwiperComponent>
      </div>
    </div>
  );
}
