import type { Category, Product } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";
import { PdpDiscoveryLinkList } from "@/components/products/PdpDiscoveryLinkList";
import { ReportListingButton } from "@/components/products/ReportListingButton";
import type { PdpRelatedDiscoveryContext } from "@/lib/pdp/load-related-discovery";

export function PdpRelatedDiscoveryChips({
  plan,
  coverByItemKey,
}: PdpRelatedDiscoveryContext) {
  if (!plan.chips.length) return null;

  return (
    <MarketplaceSection data-pdp-related-search-chips>
      <MarketplacePage className="bg-transparent">
        <PdpDiscoveryLinkList
          items={plan.chips}
          coverByItemKey={coverByItemKey}
          variant="circle"
          className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        />
      </MarketplacePage>
    </MarketplaceSection>
  );
}

function formatListedDate(
  rawDate: string | null | undefined,
  locale: string,
): string | null {
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function resolveFavoritesCount(product: Product | undefined): number {
  if (!product) return 0;
  const direct = (product as Product & { favorites_count?: number | null })
    .favorites_count;
  if (typeof direct === "number" && direct > 0) return direct;
  const signals = (
    product as Product & {
      merchandising_signals?: Array<{ key?: string; value?: unknown }>;
    }
  ).merchandising_signals;
  const favSignal = signals?.find(
    (signal) =>
      signal.key &&
      /favorite/i.test(signal.key) &&
      typeof signal.value === "number" &&
      signal.value > 0,
  );
  return typeof favSignal?.value === "number" ? favSignal.value : 0;
}

function deepestCategory(categories: Category[]): Category | null {
  if (!categories.length) return null;
  return categories.reduce((best, candidate) => {
    const bestDepth = best.ancestors?.length ?? 0;
    const candidateDepth = candidate.ancestors?.length ?? 0;
    return candidateDepth > bestDepth ? candidate : best;
  }, categories[0]);
}

function buildBottomBreadcrumbs(
  product: Product | undefined,
  basePath: string,
  homepageLabel: string,
  productsLabel: string,
): Array<{ label: string; href: string }> {
  const trail: Array<{ label: string; href: string }> = [
    { label: homepageLabel, href: basePath },
  ];
  const primary = deepestCategory(product?.categories ?? []);
  if (primary) {
    for (const ancestor of primary.ancestors ?? []) {
      if (ancestor.name && ancestor.permalink) {
        trail.push({
          label: ancestor.name,
          href: `${basePath}/c/${ancestor.permalink}`,
        });
      }
    }
    if (primary.name && primary.permalink) {
      trail.push({
        label: primary.name,
        href: `${basePath}/c/${primary.permalink}`,
      });
    }
  } else {
    trail.push({
      label: productsLabel,
      href: `${basePath}/products`,
    });
  }
  return trail;
}

export async function PdpRelatedDiscoveryExplore({
  plan,
  coverByItemKey,
  locale,
  basePath,
  product,
  showExploreHeading = true,
}: PdpRelatedDiscoveryContext & {
  locale: string;
  basePath?: string;
  product?: Product;
  showExploreHeading?: boolean;
}) {
  const hasDiscovery = plan.gridTiles.length > 0 || plan.pills.length > 0;
  const listedDate = formatListedDate(
    product?.available_on ??
      (product as (Product & { created_at?: string }) | undefined)?.created_at,
    locale,
  );
  const favoritesCount = resolveFavoritesCount(product);

  if (!hasDiscovery && !listedDate && !basePath) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "products",
  });
  const tNav = await getTranslations({
    locale: locale as Locale,
    namespace: "navigation",
  });

  const breadcrumbs = basePath
    ? buildBottomBreadcrumbs(
        product,
        basePath,
        t("homepageBreadcrumb"),
        tNav("products"),
      )
    : [];

  return (
    <section
      data-pdp-bottom-discovery
      className="mt-6 w-full border-t border-[#ece9e4] bg-[#f9f7f3] py-8 sm:mt-8 sm:py-12"
    >
      <MarketplacePage className="bg-transparent">
        {plan.gridTiles.length ? (
          <div data-pdp-explore-related-searches>
            {showExploreHeading ? (
              <h2 className="mb-3.5 font-display text-[21px] font-normal tracking-tight text-[#1a1a1a] sm:mb-4 sm:text-[24px]">
                {t("pdpExploreRelatedSearches")}
              </h2>
            ) : null}
            <PdpDiscoveryLinkList
              items={plan.gridTiles}
              coverByItemKey={coverByItemKey}
              variant="tile"
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6"
            />
          </div>
        ) : null}

        {plan.pills.length ? (
          <div
            data-pdp-explore-more-related-searches
            className={plan.gridTiles.length ? "mt-7 sm:mt-8" : undefined}
          >
            <h3 className="mb-3 font-display text-[17px] font-normal tracking-tight text-[#1a1a1a] sm:mb-3.5 sm:text-[18px]">
              {t("pdpExploreMoreRelatedSearches")}
            </h3>
            <ul className="flex flex-wrap gap-2 sm:gap-2.5">
              {plan.pills.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center rounded-full bg-[#efede9] px-3.5 py-2 text-[12.5px] font-medium text-[#1a1a1a] transition-colors hover:bg-marketplace-accent sm:px-4 sm:text-[13px]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {listedDate ||
        favoritesCount > 0 ||
        breadcrumbs.length > 0 ||
        product ? (
          <footer
            data-pdp-listing-footer
            className={hasDiscovery ? "mt-8 space-y-2 sm:mt-10" : "space-y-2"}
          >
            {listedDate || favoritesCount > 0 || product ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-[#595652] sm:text-[13px]">
                {listedDate ? (
                  <span>{t("listedOn", { date: listedDate })}</span>
                ) : null}
                {favoritesCount > 0 ? (
                  <span className="underline decoration-[#595652]/65 underline-offset-2">
                    {t("favoritesCount", { count: favoritesCount })}
                  </span>
                ) : null}
                {product ? (
                  <span className="md:hidden">
                    <ReportListingButton productId={product.id} />
                  </span>
                ) : null}
              </div>
            ) : null}

            {breadcrumbs.length > 0 ? (
              <nav aria-label={tNav("breadcrumb")}>
                <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] text-[#595652] sm:text-[13px]">
                  {breadcrumbs.map((crumb, index) => (
                    <li
                      key={`${crumb.href}-${index}`}
                      className="inline-flex items-center gap-1.5"
                    >
                      {index > 0 ? (
                        <span aria-hidden className="text-[#8c8780]">
                          &gt;
                        </span>
                      ) : null}
                      <Link
                        href={crumb.href}
                        className="underline decoration-[#595652]/65 underline-offset-2 transition-colors hover:text-[#1a1a1a] hover:decoration-[#1a1a1a]"
                      >
                        {crumb.label}
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
          </footer>
        ) : null}
      </MarketplacePage>
    </section>
  );
}
