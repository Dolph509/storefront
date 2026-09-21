"use client";

import type { SearchRecovery } from "@spree/sdk";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  buildListingSearchParams,
  parseListingSearchParams,
} from "@/lib/utils/listing-search-params";
import { applySearchRecoveryRelaxation } from "@/lib/utils/search-recovery";

interface SearchRecoveryPanelProps {
  query: string;
  recovery: SearchRecovery;
}

export function SearchRecoveryPanel({
  query,
  recovery,
}: SearchRecoveryPanelProps) {
  const t = useTranslations("products");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const baseState = useMemo(
    () => parseListingSearchParams(searchParams),
    [searchParams],
  );

  const suggested = recovery.suggested_queries?.[0];

  const buildHref = (nextQuery: string, relax = false) => {
    const filters = relax
      ? applySearchRecoveryRelaxation(
          baseState.filters,
          recovery.relax_filters ?? [],
        )
      : baseState.filters;
    const params = buildListingSearchParams(
      new URLSearchParams(searchParams.toString()),
      { query: nextQuery, filters },
    );
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const relaxHref = useMemo(() => {
    if (!recovery.relax_filters?.length) return null;
    const params = buildListingSearchParams(
      new URLSearchParams(searchParams.toString()),
      {
        query: baseState.query,
        filters: applySearchRecoveryRelaxation(
          baseState.filters,
          recovery.relax_filters,
        ),
      },
    );
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [
    baseState.filters,
    baseState.query,
    pathname,
    recovery.relax_filters,
    searchParams,
  ]);

  return (
    <div className="mx-auto mt-6 max-w-lg text-left">
      {suggested && suggested.toLowerCase() !== query.toLowerCase() ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm text-gray-700">{t("searchRecoveryTry")}</p>
          <p className="mt-1 font-medium text-gray-900">“{suggested}”</p>
          <Button variant="link" className="mt-2 h-auto p-0" asChild>
            <Link href={buildHref(suggested)}>
              {t("searchRecoverySearchTerm")}
            </Link>
          </Button>
        </div>
      ) : null}

      {recovery.suggested_queries && recovery.suggested_queries.length > 1 ? (
        <ul
          className="mt-4 space-y-2"
          aria-label={t("searchRecoverySuggestions")}
        >
          {recovery.suggested_queries.slice(1).map((term) => (
            <li key={term}>
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(term)}>{term}</Link>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {relaxHref ? (
        <div className="mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={relaxHref}>{t("searchRecoveryRelaxFilters")}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
