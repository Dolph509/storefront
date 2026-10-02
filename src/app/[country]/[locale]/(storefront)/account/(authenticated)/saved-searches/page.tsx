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
  // actionResult spreads the paginated response: { success, data, meta }
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
        <ul
          className="divide-y divide-marketplace-border-subtle overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface"
          data-theme-account-row-list
        >
          {searches.map((search) => (
            <li
              key={search.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-marketplace-foreground">
                  {search.name}
                </p>
                {search.query ? (
                  <p className="mt-1 truncate text-sm text-marketplace-muted-foreground">
                    “{search.query}”
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildSearchHref(basePath, search)}>
                    {t("runSearch")}
                  </Link>
                </Button>
                <SavedSearchActions
                  id={search.id}
                  notificationsEnabled={Boolean(search.notifications_enabled)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
