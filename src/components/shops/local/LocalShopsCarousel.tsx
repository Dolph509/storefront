"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import type Swiper from "swiper";
import { Navigation } from "swiper/modules";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { cn } from "@/lib/utils";

type CarouselDensity = "picks" | "featured" | "star";

interface LocalShopsCarouselProps {
  children: ReactNode[];
  density?: CarouselDensity;
  className?: string;
  label?: string;
}

const BREAKPOINTS: Record<
  CarouselDensity,
  Record<number, { slidesPerView: number; spaceBetween: number }>
> = {
  picks: {
    640: { slidesPerView: 3.25, spaceBetween: 16 },
    768: { slidesPerView: 4.2, spaceBetween: 18 },
    1024: { slidesPerView: 5.2, spaceBetween: 18 },
    1280: { slidesPerView: 6, spaceBetween: 20 },
  },
  featured: {
    640: { slidesPerView: 2.6, spaceBetween: 16 },
    768: { slidesPerView: 3.4, spaceBetween: 18 },
    1024: { slidesPerView: 4.2, spaceBetween: 20 },
    1280: { slidesPerView: 5, spaceBetween: 20 },
  },
  star: {
    640: { slidesPerView: 1.65, spaceBetween: 16 },
    768: { slidesPerView: 2.25, spaceBetween: 18 },
    1024: { slidesPerView: 3.1, spaceBetween: 20 },
    1280: { slidesPerView: 3.5, spaceBetween: 20 },
  },
};

const MOBILE_VIEW: Record<CarouselDensity, number> = {
  picks: 2.15,
  featured: 1.7,
  star: 1.15,
};

const NAV_BUTTON =
  "absolute top-[34%] z-20 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e4ddd2] bg-white/95 text-marketplace-foreground shadow-[0_4px_16px_rgba(49,43,54,0.12)] backdrop-blur-sm transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out hover:border-marketplace-brand hover:bg-marketplace-brand hover:text-marketplace-brand-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand disabled:cursor-default disabled:opacity-0 motion-reduce:transition-none md:size-12";

export function LocalShopsCarousel({
  children,
  density = "picks",
  className,
  label,
}: LocalShopsCarouselProps): ReactElement | null {
  const t = useTranslations("shops");
  const items = children.filter(Boolean);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(items.length > 1);
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

  if (items.length === 0) return null;

  const showPrev = hasOverflow && !isBeginning;
  const showNext = hasOverflow && !isEnd;
  const regionLabel = label ?? t("carouselLabel");

  return (
    <section
      className={cn("relative min-w-0 w-full", className)}
      data-local-shops-carousel={density}
      aria-roledescription="carousel"
      aria-label={regionLabel}
    >
      <button
        ref={prevRef}
        type="button"
        aria-label={t("carouselPrev")}
        aria-hidden={!showPrev}
        tabIndex={showPrev ? 0 : -1}
        disabled={!showPrev}
        className={cn(
          NAV_BUTTON,
          "left-0 sm:-left-3 lg:-left-5",
          showPrev ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft aria-hidden className="size-5" />
      </button>
      <button
        ref={nextRef}
        type="button"
        aria-label={t("carouselNext")}
        aria-hidden={!showNext}
        tabIndex={showNext ? 0 : -1}
        disabled={!showNext}
        className={cn(
          NAV_BUTTON,
          "right-0 sm:-right-3 lg:-right-5",
          showNext ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight aria-hidden className="size-5" />
      </button>

      <div className="min-w-0 overflow-hidden px-0.5">
        <SwiperComponent
          modules={[Navigation]}
          watchOverflow
          slidesPerView={MOBILE_VIEW[density]}
          spaceBetween={14}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          breakpoints={BREAKPOINTS[density]}
          onBeforeInit={handleBeforeInit}
          onSwiper={handleSwiper}
          onSlideChange={updateNavState}
          onReachBeginning={updateNavState}
          onReachEnd={updateNavState}
          onAfterInit={updateNavState}
          onResize={updateNavState}
          onBreakpoint={updateNavState}
          onUpdate={updateNavState}
          className="!w-full max-w-full"
        >
          {items.map((child, index) => (
            <SwiperSlide key={index} className="!h-auto">
              <div className="h-full min-w-0">{child}</div>
            </SwiperSlide>
          ))}
        </SwiperComponent>
      </div>
    </section>
  );
}
