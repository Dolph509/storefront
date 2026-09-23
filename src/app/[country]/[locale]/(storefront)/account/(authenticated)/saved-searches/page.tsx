import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
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
  const searches = (result.success ? result.data.data : []) as SavedSearchRow[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {t("savedSearches")}
      </h1>
      {!searches.length ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <EmptyStateIllustration
            name="no-saved-searches"
            className="mx-auto mb-4 text-gray-600"
          />
          <p className="font-medium text-gray-900">{t("savedSearchesEmpty")}</p>
          <Button className="mt-6" asChild>
            <Link href={`${basePath}/products`}>{t("browseMarketplace")}</Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {searches.map((search) => (
            <li
              key={search.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{search.name}</p>
                {search.query ? (
                  <p className="mt-1 truncate text-sm text-gray-500">
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
