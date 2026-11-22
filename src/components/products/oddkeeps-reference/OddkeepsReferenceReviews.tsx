"use client";

import type { ProductReview } from "@spree/sdk";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReviewMediaLightbox } from "@/components/reviews/ReviewMediaLightbox";
import {
  flattenReviewMedia,
  type ReviewMediaItem,
} from "@/components/reviews/review-media-items";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProductReviews } from "@/lib/data/reviews";
import { sellerDisplayName } from "@/lib/utils/seller-display";

const CAROUSEL_MAX_REVIEWS = 5;
const MODAL_PAGE_SIZE = 20;

type AttributeScoreInput = {
  key?: string | number;
  label?: string;
  ratings_count?: number;
};

type ModalSort = "suggested" | "newest" | "highest" | "lowest";

type TopicChip = {
  id: string;
  label: string;
  count: number;
  kind: "attribute" | "quality" | "shipping" | "service" | "media";
  matchKey?: string;
};

type OddkeepsReferenceReviewsProps = {
  productSlug: string;
  sellerName?: string | null;
  sellerLogoUrl?: string | null;
  reviews: ProductReview[];
  totalCount: number;
  averageRating: number | null;
  ratingDistribution?: Record<string, number> | null;
  attributeScores?: AttributeScoreInput[];
};

const AVATAR_TONES = [
  "bg-[#dce8df] text-[#1b4332]",
  "bg-[#e6e0f0] text-[#3f3160]",
  "bg-[#f2e2d2] text-[#6b3f1d]",
  "bg-[#dce6f2] text-[#1e3f66]",
  "bg-[#efe5d5] text-[#5c4827]",
];

function formatShortDate(
  dateValue: string | null | undefined,
  locale: string,
): string | null {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function reviewerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function avatarToneClass(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

function ReviewStars({
  rating,
  tone = "green",
}: {
  rating: number;
  tone?: "green" | "dark";
}) {
  const filledStars = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  const activeClass =
    tone === "dark"
      ? "size-4 fill-[#1a1a1a] text-[#1a1a1a]"
      : "size-3.5 fill-[#1b4332] text-[#1b4332]";
  const emptyClass =
    tone === "dark" ? "size-4 text-[#d4d1cc]" : "size-3.5 text-[#d4d1cc]";

  return (
    <div
      role="img"
      className="flex items-center gap-0.5"
      aria-label={`${filledStars} / 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={n <= filledStars ? activeClass : emptyClass}
          aria-hidden
        />
      ))}
    </div>
  );
}

function apiSortFor(
  sort: ModalSort,
): "most_helpful" | "newest" | "highest" | "lowest" {
  if (sort === "suggested") return "most_helpful";
  return sort;
}

export function OddkeepsReferenceReviews({
  productSlug,
  sellerName,
  sellerLogoUrl,
  reviews,
  totalCount,
  averageRating,
  ratingDistribution,
  attributeScores = [],
}: OddkeepsReferenceReviewsProps) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);

  const carouselReviews = reviews.slice(0, CAROUSEL_MAX_REVIEWS);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(carouselReviews.length > 1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalReviews, setModalReviews] = useState<ProductReview[]>(reviews);
  const [modalPage, setModalPage] = useState(1);
  const [modalHasMore, setModalHasMore] = useState(totalCount > reviews.length);
  const [loadingModal, setLoadingModal] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchedFullRef = useRef(reviews.length >= totalCount);

  const [modalSort, setModalSort] = useState<ModalSort>("suggested");
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const [lightboxState, setLightboxState] = useState<{
    items: ReviewMediaItem[];
    index: number;
  } | null>(null);

  const allLoadedReviews =
    modalReviews.length >= reviews.length ? modalReviews : reviews;

  const headerMediaItems = useMemo(
    () =>
      allLoadedReviews.flatMap((review) =>
        flattenReviewMedia(review.images, review.videos),
      ),
    [allLoadedReviews],
  );

  const ratingText =
    averageRating != null && Number.isFinite(averageRating)
      ? Number(averageRating).toFixed(1)
      : null;

  const starDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const hasServerDist =
      ratingDistribution != null &&
      Object.values(ratingDistribution).some((val) => Number(val) > 0);
    if (hasServerDist && ratingDistribution) {
      for (const star of [5, 4, 3, 2, 1]) {
        counts[star] = Number(ratingDistribution[String(star)] ?? 0) || 0;
      }
    } else {
      for (const review of allLoadedReviews) {
        const star = Math.max(
          1,
          Math.min(5, Math.round(Number(review.rating) || 0)),
        );
        counts[star] = (counts[star] ?? 0) + 1;
      }
    }
    const bucketSum = Object.values(counts).reduce((sum, n) => sum + n, 0);
    const denominator = bucketSum > 0 ? bucketSum : Math.max(totalCount, 1);
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star] ?? 0,
      percent:
        bucketSum > 0
          ? Math.round(((counts[star] ?? 0) / denominator) * 100)
          : 0,
    }));
  }, [ratingDistribution, allLoadedReviews, totalCount]);

  const topicChips = useMemo<TopicChip[]>(() => {
    const chips: TopicChip[] = [];

    for (const score of attributeScores) {
      const label = String(score.label ?? "").trim();
      const count = Number(score.ratings_count ?? 0);
      if (!label || count <= 0) continue;
      chips.push({
        id: `attr-${String(score.key ?? label)}`,
        label,
        count,
        kind: "attribute",
        matchKey: String(score.key ?? label),
      });
    }

    if (chips.length === 0) {
      const qualityCount = allLoadedReviews.filter(
        (r) => r.item_quality_rating != null && r.item_quality_rating >= 4,
      ).length;
      const shippingCount = allLoadedReviews.filter(
        (r) => r.shipping_rating != null && r.shipping_rating >= 4,
      ).length;
      const serviceCount = allLoadedReviews.filter(
        (r) =>
          r.customer_service_rating != null && r.customer_service_rating >= 4,
      ).length;

      if (qualityCount > 0) {
        chips.push({
          id: "sub-quality",
          label: t("itemQualityRating"),
          count: qualityCount,
          kind: "quality",
        });
      }
      if (serviceCount > 0) {
        chips.push({
          id: "sub-service",
          label: t("customerServiceRating"),
          count: serviceCount,
          kind: "service",
        });
      }
      if (shippingCount > 0) {
        chips.push({
          id: "sub-shipping",
          label: t("shippingRating"),
          count: shippingCount,
          kind: "shipping",
        });
      }
    }

    const mediaCount = allLoadedReviews.filter(
      (r) => (r.images?.length ?? 0) > 0 || (r.videos?.length ?? 0) > 0,
    ).length;
    if (mediaCount > 0) {
      chips.push({
        id: "media",
        label: t("filterWithMedia"),
        count: mediaCount,
        kind: "media",
      });
    }

    return chips;
  }, [attributeScores, allLoadedReviews, t]);

  const activeTopic = useMemo(
    () => topicChips.find((chip) => chip.id === activeTopicId) ?? null,
    [topicChips, activeTopicId],
  );

  const displayedModalReviews = useMemo(() => {
    let list = [...modalReviews];

    if (selectedStar != null) {
      list = list.filter(
        (review) => Math.round(Number(review.rating) || 0) === selectedStar,
      );
    }

    if (activeTopic) {
      if (activeTopic.kind === "media") {
        list = list.filter(
          (r) => (r.images?.length ?? 0) > 0 || (r.videos?.length ?? 0) > 0,
        );
      } else if (activeTopic.kind === "quality") {
        list = list.filter(
          (r) => r.item_quality_rating != null && r.item_quality_rating >= 4,
        );
      } else if (activeTopic.kind === "shipping") {
        list = list.filter(
          (r) => r.shipping_rating != null && r.shipping_rating >= 4,
        );
      } else if (activeTopic.kind === "service") {
        list = list.filter(
          (r) =>
            r.customer_service_rating != null && r.customer_service_rating >= 4,
        );
      } else if (activeTopic.kind === "attribute") {
        const needle = activeTopic.label.toLowerCase();
        list = list.filter((r) => {
          const hasAttr = r.attribute_answers?.some(
            (ans) =>
              ans.key === activeTopic.matchKey ||
              ans.label.toLowerCase() === needle,
          );
          const inText = `${r.title ?? ""} ${r.body ?? ""}`
            .toLowerCase()
            .includes(needle);
          return hasAttr || inText;
        });
      }
    }

    if (modalSort === "highest") {
      list.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (modalSort === "lowest") {
      list.sort((a, b) => Number(a.rating) - Number(b.rating));
    } else if (modalSort === "newest") {
      list.sort((a, b) => {
        const ta = new Date(a.published_at ?? a.created_at).getTime();
        const tb = new Date(b.published_at ?? b.created_at).getTime();
        return tb - ta;
      });
    } else {
      list.sort((a, b) => {
        const mediaDiff =
          ((b.images?.length ?? 0) + (b.videos?.length ?? 0) > 0 ? 1 : 0) -
          ((a.images?.length ?? 0) + (a.videos?.length ?? 0) > 0 ? 1 : 0);
        if (mediaDiff !== 0) return mediaDiff;
        return (b.helpful_votes_count ?? 0) - (a.helpful_votes_count ?? 0);
      });
    }

    return list;
  }, [modalReviews, selectedStar, activeTopic, modalSort]);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
    if (carouselReviews.length > 1 && maxScroll > 0) {
      const ratio = el.scrollLeft / maxScroll;
      const idx = Math.round(ratio * (carouselReviews.length - 1));
      setActiveSlide(Math.max(0, Math.min(carouselReviews.length - 1, idx)));
    }
  }, [carouselReviews.length]);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  const scrollByDirection = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-slide]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const scrollToSlide = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const slides = el.querySelectorAll<HTMLElement>("[data-review-slide]");
    const target = slides[index];
    if (target) {
      el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
      setActiveSlide(index);
    }
  };

  useEffect(() => {
    if (!modalOpen || fetchedFullRef.current) return;
    let cancelled = false;
    setLoadingModal(true);
    getProductReviews(productSlug, {
      sort: apiSortFor(modalSort),
      limit: MODAL_PAGE_SIZE,
      page: 1,
    })
      .then((res) => {
        if (cancelled) return;
        const data = res.data ?? [];
        setModalReviews(data.length > 0 ? data : reviews);
        setModalPage(1);
        const reportedTotal = res.meta?.count ?? totalCount;
        setModalHasMore(data.length < reportedTotal);
        fetchedFullRef.current = true;
      })
      .catch(() => {
        if (!cancelled) {
          setModalReviews(reviews);
          setModalHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingModal(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modalOpen, productSlug, reviews, totalCount, modalSort]);

  const handleSortChange = (nextSort: ModalSort) => {
    setModalSort(nextSort);
    if (modalHasMore || modalReviews.length < totalCount) {
      fetchedFullRef.current = false;
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !modalHasMore) return;
    const nextPage = modalPage + 1;
    setLoadingMore(true);
    try {
      const res = await getProductReviews(productSlug, {
        sort: apiSortFor(modalSort),
        limit: MODAL_PAGE_SIZE,
        page: nextPage,
      });
      const incoming = res.data ?? [];
      setModalReviews((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        for (const item of incoming) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
          }
        }
        const reportedTotal = res.meta?.count ?? totalCount;
        setModalHasMore(incoming.length > 0 && merged.length < reportedTotal);
        return merged;
      });
      setModalPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  const sortLabel =
    modalSort === "newest"
      ? t("sortMostRecent")
      : modalSort === "highest"
        ? t("sortHighestRating")
        : modalSort === "lowest"
          ? t("sortLowestRating")
          : t("sortSuggested");

  const ratingFilterLabel =
    selectedStar != null
      ? t("starLabel", { count: selectedStar })
      : t("ratingFilter");

  const hasActiveFilter = selectedStar != null || activeTopicId != null;
  const formattedSellerName = sellerName ? sellerDisplayName(sellerName) : null;

  return (
    <section
      id="reviews"
      data-theme-reviews-section
      data-oddkeeps-reviews
      className="min-w-0 font-sans"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-[19px] font-semibold tracking-tight text-[#1a1a1a]">
              {t("reviewsShort")}
            </h2>
            {ratingText ? (
              <span className="inline-flex items-center gap-1 text-[16px] font-semibold text-[#1a1a1a]">
                <span>{ratingText}</span>
                <Star
                  className="size-4 fill-[#1b4332] text-[#1b4332]"
                  aria-hidden
                />
                <span className="text-[14px] font-normal text-[#6f6c68]">
                  ({totalCount.toLocaleString(locale)})
                </span>
              </span>
            ) : totalCount > 0 ? (
              <span className="text-[14px] text-[#6f6c68]">
                ({totalCount.toLocaleString(locale)})
              </span>
            ) : null}
          </div>

          {headerMediaItems.length > 0 ? (
            <div className="flex items-center gap-2.5">
              {headerMediaItems.slice(0, 4).map((item, idx) => (
                <button
                  key={`${item.url}-${idx}`}
                  type="button"
                  onClick={() =>
                    setLightboxState({ items: headerMediaItems, index: idx })
                  }
                  className="relative size-[68px] shrink-0 overflow-hidden rounded-[8px] bg-[#f4f2ee] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
                >
                  {item.kind === "video" ? (
                    <video
                      src={item.url}
                      className="size-full object-cover"
                      muted
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5">
          {carouselReviews.length > 1 ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                aria-label={t("previousPage")}
                disabled={!canPrev}
                onClick={() => scrollByDirection(-1)}
                className="grid size-9 place-items-center rounded-full border border-[#d4d1cc] bg-white text-[#1a1a1a] transition-colors hover:bg-marketplace-accent disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={t("nextPage")}
                disabled={!canNext}
                onClick={() => scrollByDirection(1)}
                className="grid size-9 place-items-center rounded-full border border-[#d4d1cc] bg-white text-[#1a1a1a] transition-colors hover:bg-marketplace-accent disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          ) : null}

          {totalCount > 0 ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-9 items-center rounded-full border border-[#d4d1cc] bg-white px-5 text-[13px] font-medium text-[#1a1a1a] transition-colors hover:bg-marketplace-accent"
            >
              {t("seeAllReviews", { count: totalCount })}
            </button>
          ) : null}
        </div>
      </div>

      {carouselReviews.length > 0 ? (
        <div className="mt-6">
          <div
            ref={trackRef}
            onScroll={updateScrollState}
            data-oddkeeps-reviews-carousel
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {carouselReviews.map((review) => {
              const name =
                review.customer_name?.trim() || t("anonymousReviewer");
              const dateLabel = formatShortDate(
                review.published_at ?? review.created_at,
                locale,
              );
              const body = review.body?.trim() || review.title?.trim() || "";
              const reviewMedia = flattenReviewMedia(
                review.images,
                review.videos,
              );

              return (
                <article
                  key={review.id}
                  data-review-slide
                  className="flex w-[86%] shrink-0 snap-start flex-col justify-between rounded-[12px] border border-[#eae7e2] bg-white p-4 sm:w-[75%] sm:p-5 md:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.833rem)]"
                >
                  <div>
                    <ReviewStars rating={review.rating} />
                    {review.title && review.body ? (
                      <p className="mt-2.5 text-[14px] font-semibold text-[#1a1a1a]">
                        {review.title}
                      </p>
                    ) : null}
                    {body ? (
                      <p className="mt-2 line-clamp-4 text-[14px] leading-[1.6] text-[#2b2a29]">
                        {body}
                      </p>
                    ) : null}
                    {reviewMedia.length > 0 ? (
                      <div className="mt-3 flex gap-2">
                        {reviewMedia.slice(0, 3).map((item, idx) => (
                          <button
                            key={`${item.url}-${idx}`}
                            type="button"
                            onClick={() =>
                              setLightboxState({
                                items: reviewMedia,
                                index: idx,
                              })
                            }
                            className="size-12 overflow-hidden rounded-[6px] bg-[#f4f2ee]"
                          >
                            {item.kind === "video" ? (
                              <video
                                src={item.url}
                                className="size-full object-cover"
                                muted
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.url}
                                alt=""
                                className="size-full object-cover"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center gap-2.5 text-[12.5px]">
                    <span
                      aria-hidden
                      className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${avatarToneClass(name)}`}
                    >
                      {reviewerInitials(name)}
                    </span>
                    <span className="truncate font-medium text-[#1a1a1a]">
                      {name}
                    </span>
                    {dateLabel ? (
                      <>
                        <span className="text-[#c5c0b8]" aria-hidden>
                          ·
                        </span>
                        <span className="shrink-0 text-[#6f6c68]">
                          {dateLabel}
                        </span>
                      </>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          {carouselReviews.length > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {carouselReviews.map((review, idx) => (
                <button
                  key={review.id}
                  type="button"
                  aria-label={`${idx + 1} / ${carouselReviews.length}`}
                  onClick={() => scrollToSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeSlide
                      ? "w-5 bg-[#1b4332]"
                      : "w-1.5 bg-[#d4d1cc] hover:bg-[#a6a19a]"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-5 text-sm text-[#6f6c68]">
          {t("emptyProductHeading")}
        </p>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-[calc(100%-1rem)] border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-[740px]"
        >
          <div className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-[#eae7e2] bg-white text-[#1a1a1a] shadow-2xl">
            <DialogHeader className="shrink-0 px-4 pb-3 pt-5 text-left sm:px-7 sm:pt-6">
              <DialogTitle className="pr-10 font-sans text-[17px] font-semibold tracking-tight text-[#1a1a1a] sm:pr-0 sm:text-[18px]">
                {t("pdpTitle")} ({totalCount.toLocaleString(locale)})
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-7 sm:pb-8">
              <div className="grid grid-cols-1 items-center gap-6 pb-6 pt-2 sm:grid-cols-[200px_1fr]">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-2">
                    <Star
                      className="size-8 fill-[#f5b301] text-[#f5b301]"
                      aria-hidden
                    />
                    <span className="font-sans text-[40px] font-semibold leading-none tracking-tight tabular-nums text-[#1a1a1a]">
                      {ratingText ?? "—"}
                    </span>
                  </div>
                  <span className="mt-1.5 text-[13px] text-[#595959] underline decoration-[#595959]/50 underline-offset-4">
                    {t("ratingsCount", { count: totalCount })}
                  </span>
                </div>

                <div className="space-y-2">
                  {starDistribution.map(({ star, percent }) => {
                    const isSelected = selectedStar === star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setSelectedStar((prev) =>
                            prev === star ? null : star,
                          )
                        }
                        aria-pressed={isSelected}
                        className={`group flex w-full items-center gap-3 rounded-md py-0.5 text-left transition-opacity ${
                          selectedStar != null && !isSelected
                            ? "opacity-45 hover:opacity-80"
                            : "opacity-100"
                        }`}
                      >
                        <span className="w-12 shrink-0 text-[13px] font-medium text-[#2b2a29] group-hover:underline">
                          {t("starBarLabel", { star })}
                        </span>
                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#efede9]">
                          <span
                            className="block h-full rounded-full bg-[#f5b301] transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </span>
                        <span className="w-10 shrink-0 text-right text-[13px] tabular-nums text-[#595959]">
                          {percent}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pb-5">
                <div className="relative inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-[13.5px] font-semibold text-[#1a1a1a] transition-colors hover:bg-marketplace-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#1b4332]">
                  <span>{sortLabel}</span>
                  <ChevronDown
                    className="size-3.5 shrink-0 text-[#1a1a1a]"
                    aria-hidden
                  />
                  <select
                    aria-label={t("sortBy")}
                    value={modalSort}
                    onChange={(e) =>
                      handleSortChange(e.target.value as ModalSort)
                    }
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  >
                    <option value="suggested">{t("sortSuggested")}</option>
                    <option value="newest">{t("sortMostRecent")}</option>
                    <option value="highest">{t("sortHighestRating")}</option>
                    <option value="lowest">{t("sortLowestRating")}</option>
                  </select>
                </div>

                <div className="relative inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-[13.5px] font-semibold text-[#1a1a1a] transition-colors hover:bg-marketplace-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#1b4332]">
                  <span>{ratingFilterLabel}</span>
                  <ChevronDown
                    className="size-3.5 shrink-0 text-[#1a1a1a]"
                    aria-hidden
                  />
                  <select
                    aria-label={t("ratingFilter")}
                    value={selectedStar == null ? "" : String(selectedStar)}
                    onChange={(e) =>
                      setSelectedStar(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  >
                    <option value="">{t("ratingFilter")}</option>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <option key={star} value={star}>
                        {t("starLabel", { count: star })}
                      </option>
                    ))}
                  </select>
                </div>

                {topicChips.map((chip) => {
                  const active = activeTopicId === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setActiveTopicId((prev) =>
                          prev === chip.id ? null : chip.id,
                        )
                      }
                      className={`inline-flex h-9 items-center rounded-full px-4 text-[13.5px] font-medium transition-colors ${
                        active
                          ? "bg-[#1a1a1a] text-white"
                          : "bg-[#f3f2ef] text-[#1a1a1a] hover:bg-marketplace-accent"
                      }`}
                    >
                      {t("filterTopicCount", {
                        label: chip.label,
                        count: chip.count,
                      })}
                    </button>
                  );
                })}

                {hasActiveFilter ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStar(null);
                      setActiveTopicId(null);
                    }}
                    className="ml-auto text-[12.5px] font-medium text-[#595959] underline underline-offset-4 hover:text-[#1a1a1a]"
                  >
                    {t("filterClearTopics")}
                  </button>
                ) : null}
              </div>

              {headerMediaItems.length > 0 ? (
                <div className="mb-6 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {headerMediaItems.slice(0, 10).map((item, idx) => (
                    <button
                      key={`${item.url}-${idx}`}
                      type="button"
                      onClick={() =>
                        setLightboxState({
                          items: headerMediaItems,
                          index: idx,
                        })
                      }
                      className="relative h-[132px] w-[112px] shrink-0 overflow-hidden rounded-[12px] bg-[#f4f2ee] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
                    >
                      {item.kind === "video" ? (
                        <video
                          src={item.url}
                          className="size-full object-cover"
                          muted
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt=""
                          className="size-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : null}

              {loadingModal ? (
                <div
                  className="flex items-center justify-center gap-2 py-16 text-sm text-[#6f6c68]"
                  role="status"
                >
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("loadingReviews")}
                </div>
              ) : displayedModalReviews.length === 0 ? (
                <p className="border-t border-[#ece9e4] py-12 text-center text-sm text-[#6f6c68]">
                  {t("noMatchingReviews")}
                </p>
              ) : (
                <div className="divide-y divide-[#ece9e4] border-t border-[#ece9e4]">
                  {displayedModalReviews.map((review) => {
                    const name =
                      review.customer_name?.trim() || t("anonymousReviewer");
                    const dateLabel = formatShortDate(
                      review.published_at ?? review.created_at,
                      locale,
                    );
                    const body =
                      review.body?.trim() || review.title?.trim() || "";
                    const reviewMedia = flattenReviewMedia(
                      review.images,
                      review.videos,
                    );
                    const primaryThumb = reviewMedia[0] ?? null;
                    const attributeMeta = (review.attribute_answers ?? [])
                      .map((ans) => {
                        const val =
                          ans.text_value?.trim() ||
                          ans.choice_values?.filter(Boolean).join(", ") ||
                          null;
                        return val ? `${ans.label}: ${val}` : null;
                      })
                      .filter((item): item is string => Boolean(item));
                    const responderName =
                      (review.seller_name
                        ? sellerDisplayName(review.seller_name)
                        : null) || formattedSellerName;

                    return (
                      <article key={review.id} className="py-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <ReviewStars rating={review.rating} tone="dark" />
                          {review.recommended === true ? (
                            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#2d6a4f]">
                              <Check
                                className="size-3.5 stroke-[2.5]"
                                aria-hidden
                              />
                              {t("recommends")}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <span
                            aria-hidden
                            className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${avatarToneClass(name)}`}
                          >
                            {reviewerInitials(name)}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-[13.5px]">
                              <span className="font-semibold text-[#1a1a1a]">
                                {name}
                              </span>
                              {dateLabel ? (
                                <>
                                  <span className="text-[#c5c0b8]" aria-hidden>
                                    |
                                  </span>
                                  <span className="text-[#6f6c68]">
                                    {dateLabel}
                                  </span>
                                </>
                              ) : null}
                            </div>
                            {attributeMeta.length > 0 ? (
                              <p className="mt-0.5 truncate text-[12.5px] text-[#6f6c68]">
                                {attributeMeta.join(" · ")}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-start justify-between gap-5">
                          <div className="min-w-0 flex-1">
                            {review.title && review.body ? (
                              <p className="mb-1 text-[14.5px] font-semibold text-[#1a1a1a]">
                                {review.title}
                              </p>
                            ) : null}
                            {body ? (
                              <p className="whitespace-pre-wrap text-[14.5px] leading-[1.6] text-[#222222]">
                                {body}
                              </p>
                            ) : null}
                          </div>

                          {primaryThumb ? (
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxState({
                                  items: reviewMedia,
                                  index: 0,
                                })
                              }
                              className="relative size-[78px] shrink-0 overflow-hidden rounded-[10px] bg-[#f4f2ee] transition-opacity hover:opacity-90"
                            >
                              {primaryThumb.kind === "video" ? (
                                <video
                                  src={primaryThumb.url}
                                  className="size-full object-cover"
                                  muted
                                />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={primaryThumb.url}
                                  alt=""
                                  className="size-full object-cover"
                                />
                              )}
                            </button>
                          ) : null}
                        </div>

                        {review.seller_reply ? (
                          <div className="mt-4 pl-6">
                            <div className="flex items-center gap-2">
                              {sellerLogoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={sellerLogoUrl}
                                  alt=""
                                  className="size-6 shrink-0 rounded-full object-cover"
                                />
                              ) : (
                                <span
                                  aria-hidden
                                  className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e8e4dc] text-[10px] font-semibold text-[#3d3b38]"
                                >
                                  {reviewerInitials(responderName ?? "S")}
                                </span>
                              )}
                              <span className="text-[13.5px] font-semibold text-[#1a1a1a]">
                                {responderName
                                  ? t("responseFrom", { seller: responderName })
                                  : t("sellerResponse")}
                              </span>
                            </div>
                            <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-[1.55] text-[#45423e]">
                              {review.seller_reply}
                            </p>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}

              {!loadingModal &&
              (modalHasMore || modalReviews.length < totalCount) ? (
                <div className="mt-6 flex justify-center border-t border-[#ece9e4] pt-5">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => void handleLoadMore()}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d4d1cc] bg-white px-6 text-[13.5px] font-medium text-[#1a1a1a] transition-colors hover:bg-marketplace-accent disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : null}
                    {t("loadMoreReviews")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <DialogClose
            aria-label={t("closeReviewsModal")}
            className="absolute right-3 top-3 grid size-9 cursor-pointer place-items-center rounded-full bg-white text-[#1a1a1a] shadow-md ring-1 ring-black/10 transition-colors hover:bg-marketplace-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332] sm:-right-12 sm:top-2"
          >
            <X className="size-4" aria-hidden />
          </DialogClose>
        </DialogContent>
      </Dialog>

      {lightboxState && lightboxState.items.length > 0 ? (
        <ReviewMediaLightbox
          items={lightboxState.items}
          activeIndex={lightboxState.index}
          onNavigate={(index) =>
            setLightboxState((prev) => (prev ? { ...prev, index } : null))
          }
          onClose={() => setLightboxState(null)}
        />
      ) : null}
    </section>
  );
}
