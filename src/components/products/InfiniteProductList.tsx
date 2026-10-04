"use client";

import type { PaginatedResponse, Product, ProductListParams } from "@spree/sdk";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import {
  SEARCH_RESULTS_LIST_ID,
  searchProductHrefForProduct,
} from "@/lib/discovery-context";

interface InfiniteProductListProps {
  initialProducts: Product[];
  initialPage: number;
  totalPages: number;
  /**
   * SDK list params describing the current filter/sort/query state,
   * including the `limit` that the next-page fetch should reuse.
   */
  listParams: ProductListParams;
  /**
   * Server action fetching one page of products. Already bound to any
   * fixed context (e.g. categoryId) on the server before being passed.
   */
  fetchPage: (params: ProductListParams) => Promise<PaginatedResponse<Product>>;
  basePath: string;
  categoryId?: string;
  listId?: string;
  listName?: string;
  searchQueryId?: string;
  currency?: string;
  paginationStyle?: "pages" | "load_more";
  columns?: number;
  mobileColumns?: number;
}

/**
 * Infinite-scroll product list. Hydrates with the server-rendered first
 * page already passed in, then fetches subsequent pages via the provided
 * server action when the sentinel enters the viewport.
 *
 * State belongs to this component, not to the URL — infinite scroll is
 * inherently ephemeral "what you've scrolled through" state. Filter / sort
 * changes unmount this component (via the Suspense boundary keyed on the
 * listing state) and remount it with a fresh initial page, which matches
 * user expectations.
 */
export function InfiniteProductList({
  initialProducts,
  initialPage,
  totalPages,
  listParams,
  fetchPage,
  basePath,
  categoryId,
  listId,
  listName,
  searchQueryId,
  currency,
  paginationStyle = "load_more",
  columns,
  mobileColumns,
}: InfiniteProductListProps) {
  const t = useTranslations("products");
  const tShops = useTranslations("shops");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(initialPage);
  // knownPages = the total page count observed from the most recent fetch.
  // hasMore / exhausted state is derived from currentPage < knownPages rather
  // than being mirrored in its own useState, per the "derive during render"
  // rule. Combined with hasError below, this cleanly separates "nothing
  // left to load" from "a load attempt failed".
  const [knownPages, setKnownPages] = useState(totalPages);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Pure pagination state — "are there more pages the server told us
  // about". Error state is tracked separately so a fetch failure
  // doesn't get misinterpreted as "exhausted".
  const hasMore = currentPage < knownPages;
  const firstVisiblePage = Math.max(
    1,
    Math.min(currentPage - 3, knownPages - 6),
  );
  const visiblePages = Array.from(
    { length: Math.min(7, knownPages) },
    (_, index) => firstVisiblePage + index,
  );

  // Refs mirror the values loadNextPage needs to read without forcing the
  // IntersectionObserver effect to re-subscribe on every state change.
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;
  const knownPagesRef = useRef(knownPages);
  knownPagesRef.current = knownPages;
  const hasErrorRef = useRef(hasError);
  hasErrorRef.current = hasError;
  const isLoadingRef = useRef(false);

  const loadNumberedPage = useCallback(
    (page: number) => {
      if (
        isLoadingRef.current ||
        page < 1 ||
        page > knownPagesRef.current ||
        page === currentPageRef.current
      )
        return;
      isLoadingRef.current = true;
      setHasError(false);
      startTransition(async () => {
        try {
          const response = await fetchPage({ ...listParams, page });
          setProducts(response.data);
          setCurrentPage(page);
          setKnownPages(response.meta.pages);
        } catch (error) {
          console.error("InfiniteProductList: failed to load page", error);
          setHasError(true);
        } finally {
          isLoadingRef.current = false;
        }
      });
    },
    [fetchPage, listParams],
  );

  const loadNextPage = useCallback(() => {
    if (isLoadingRef.current || hasErrorRef.current) return;
    const nextPage = currentPageRef.current + 1;
    if (nextPage > knownPagesRef.current) return;
    isLoadingRef.current = true;

    startTransition(async () => {
      try {
        const response = await fetchPage({ ...listParams, page: nextPage });
        setProducts((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const appended = response.data.filter((p) => !existing.has(p.id));
          return [...prev, ...appended];
        });
        setCurrentPage(nextPage);
        setKnownPages(response.meta.pages);
      } catch (error) {
        // Flip the error flag so the IntersectionObserver gate
        // (hasErrorRef) stops re-triggering loadNextPage in a hot
        // loop while the sentinel stays in view, and the render hides
        // the "no more products" message. The user can change filters
        // (which remounts this island) or refresh to try again.
        console.error("InfiniteProductList: failed to load next page", error);
        setHasError(true);
      } finally {
        isLoadingRef.current = false;
      }
    });
  }, [fetchPage, listParams]);

  useEffect(() => {
    if (paginationStyle === "pages") return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage, paginationStyle]);

  return (
    <>
      <div
        className="theme-product-grid grid"
        style={
          {
            ...(columns
              ? { "--marketplace-product-grid-columns": String(columns) }
              : {}),
            ...(mobileColumns
              ? {
                  "--marketplace-product-grid-mobile-columns":
                    String(mobileColumns),
                }
              : {}),
          } as CSSProperties
        }
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            href={
              searchQueryId && listId === SEARCH_RESULTS_LIST_ID
                ? searchProductHrefForProduct(basePath, product, {
                    queryId: searchQueryId,
                    position: index,
                    listId,
                  })
                : undefined
            }
            basePath={basePath}
            categoryId={categoryId}
            index={index}
            listId={listId}
            listName={listName}
            fetchPriority={index < 3 ? "high" : undefined}
            currency={currency}
          />
        ))}
      </div>

      {paginationStyle === "pages" ? (
        <nav
          aria-label={tShops("paginationLabel")}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            disabled={currentPage <= 1 || isPending}
            onClick={() => loadNumberedPage(currentPage - 1)}
            className="rounded-md border border-marketplace-border px-3 py-2 text-sm disabled:opacity-50"
          >
            {tShops("previousPage")}
          </button>
          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              disabled={isPending}
              onClick={() => loadNumberedPage(page)}
              className={`size-9 rounded-md border text-sm ${currentPage === page ? "border-marketplace-brand bg-marketplace-brand text-white" : "border-marketplace-border"}`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={!hasMore || isPending}
            onClick={() => loadNumberedPage(currentPage + 1)}
            className="rounded-md border border-marketplace-border px-3 py-2 text-sm disabled:opacity-50"
          >
            {tShops("nextPage")}
          </button>
          {isPending ? (
            <span role="status" className="sr-only">
              {t("loadingMore")}
            </span>
          ) : null}
        </nav>
      ) : (
        <div
          ref={sentinelRef}
          className="h-20 flex items-center justify-center mt-8"
        >
          {isPending && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin h-5 w-5" />
              {t("loadingMore")}
            </div>
          )}
          {!hasError && !hasMore && products.length > 0 && (
            <p className="text-gray-500 text-sm">{t("noMoreProducts")}</p>
          )}
        </div>
      )}
    </>
  );
}
