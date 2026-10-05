import { Bell, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AccountEmptyState } from "@/components/account/AccountEmptyState";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { Button } from "@/components/ui/button";
import { listSavedSearches } from "@/lib/data/saved-searches";
import { appendSavedSearchFiltersToParams } from "@/lib/utils/saved-search-filters";
import { SavedSearchActions } from "./SavedSearchActions";

interface SavedSearchesPageProps {
  params: Promise<{ country: string; locale: string }>;
}

type SavedSearchRow = {
  id: string;
  name: string;
  query?: string | null;
  filters?: Record<string, unknown> | null;
  notifications_enabled?: boolean;
};

function buildSearchHref(basePath: string, search: SavedSearchRow): string {
  const params = new URLSearchParams();
  if (search.query) params.set("q", search.query);
  appendSavedSearchFiltersToParams(params, search.filters ?? {});
  const query = params.toString();
  return query ? `${basePath}/products?${query}` : `${basePath}/products`;
}

function getFilterLabels(filters: Record<string, unknown>) {
  const labels: string[] = [];
  const min = filters.price_min;
  const max = filters.price_max;
  if (min != null || max != null) {
    labels.push(
      min != null && max != null
        ? `${min} - ${max}`
        : min != null
          ? `From ${min}`
          : `Up to ${max}`,
    );
  }
  if (filters.rating_min != null) labels.push(`${filters.rating_min}+ stars`);
  if (filters.availability) labels.push(String(filters.availability));
  if (filters.personalizable) labels.push("Personalizable");
  if (filters.sort) labels.push(`Sort: ${String(filters.sort)}`);
  if (Array.isArray(filters.option_values) && filters.option_values.length) {
    labels.push(`${filters.option_values.length} options`);
  }
  return labels;
}

export default async function SavedSearchesPage({
  params,
}: SavedSearchesPageProps) {
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "account",
  });
  const basePath = `/${country}/${locale}`;
  const result = await listSavedSearches();
  const searches = (
    result.success && Array.isArray(result.data) ? result.data : []
  ) as SavedSearchRow[];

  return (
    <div>
      <AccountPageHeader title={t("savedSearches")} />
      {!searches.length ? (
        <AccountEmptyState
          illustration="no-saved-searches"
          title={t("savedSearchesEmpty")}
          action={
            <Button asChild>
              <Link href={`${basePath}/products`}>
                {t("browseMarketplace")}
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-1">
          {searches.map((search) => {
            const filters = search.filters ?? {};
            const filterLabels = getFilterLabels(filters);

            return (
              <li
                key={search.id}
                className="group min-w-0 rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface p-4 transition-colors duration-200 hover:border-marketplace-brand/20 hover:bg-marketplace-accent/35 sm:p-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-marketplace-accent text-marketplace-brand">
                    <Search aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-marketplace-foreground">
                      {search.name}
                    </h2>
                    {search.query ? (
                      <p className="mt-1 truncate text-sm text-marketplace-muted-foreground">
                        “{search.query}”
                      </p>
                    ) : null}
                  </div>
                  <SavedSearchActions
                    id={search.id}
                    notificationsEnabled={Boolean(search.notifications_enabled)}
                  />
                </div>

                {filterLabels.length ? (
                  <div className="mt-4 flex items-start gap-2">
                    <SlidersHorizontal
                      aria-hidden="true"
                      className="mt-1 size-3.5 shrink-0 text-marketplace-muted-foreground"
                    />
                    <ul className="flex min-w-0 flex-wrap gap-1.5">
                      {filterLabels.map((label) => (
                        <li
                          key={label}
                          className="max-w-full truncate rounded-sm bg-marketplace-accent px-2 py-1 text-xs text-marketplace-muted-foreground"
                        >
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-marketplace-border-subtle pt-3">
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-marketplace-muted-foreground">
                    <Bell aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {search.notifications_enabled
                        ? t("notificationsOn")
                        : t("notificationsOff")}
                    </span>
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={buildSearchHref(basePath, search)}>
                      {t("runSearch")}
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
