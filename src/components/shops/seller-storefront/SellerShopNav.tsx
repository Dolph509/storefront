import { Search } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { SellerStorefrontTab } from "@/lib/data/seller-storefront-types";
import {
  sellerShopPath,
  sellerShopShellClass,
} from "@/lib/utils/seller-storefront";

interface SellerShopNavProps {
  slug: string;
  basePath: string;
  activeTab: SellerStorefrontTab;
  productCount: number;
  query?: string;
}

const TABS: SellerStorefrontTab[] = [
  "home",
  "products",
  "reviews",
  "about",
  "policies",
];

export async function SellerShopNav({
  slug,
  basePath,
  activeTab,
  productCount,
  query,
}: SellerShopNavProps) {
  const t = await getTranslations("sellers");
  const current = activeTab;

  return (
    <nav
      aria-label={t("shopNavLabel")}
      className="sticky top-0 z-30 border-b border-marketplace-border bg-marketplace-surface/95 backdrop-blur-sm"
      data-theme-seller-nav
    >
      <div className={sellerShopShellClass}>
        <div className="flex flex-col gap-2 py-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <ul
            className="-mb-px flex gap-5 overflow-x-auto scrollbar-none sm:gap-7"
            role="list"
          >
            {TABS.map((tab) => {
              const isActive = current === tab;
              const href = sellerShopPath(basePath, slug, tab);
              return (
                <li key={tab} className="shrink-0">
                  <Link
                    href={href}
                    className={`inline-block border-b-2 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marketplace-brand ${
                      isActive
                        ? "border-marketplace-brand font-semibold text-marketplace-foreground"
                        : "border-transparent font-medium text-marketplace-muted-foreground hover:text-marketplace-foreground"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {t(`tab_${tab}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
          <form
            method="get"
            action={sellerShopPath(basePath, slug, "products")}
            className="relative mb-2 w-full shrink-0 sm:mb-0 sm:w-72"
          >
            <input type="hidden" name="tab" value="products" />
            <label className="sr-only" htmlFor="shop-search">
              {t("searchThisShop")}
            </label>
            <input
              id="shop-search"
              name="q"
              type="search"
              defaultValue={query ?? ""}
              placeholder={t("searchAllItems", { count: productCount })}
              className="h-10 w-full rounded-[var(--marketplace-search-radius)] border border-marketplace-border bg-[var(--marketplace-search-surface)] py-1.5 pl-4 pr-10 text-sm text-marketplace-foreground placeholder:text-marketplace-muted-foreground focus:border-marketplace-brand focus:outline-none focus:ring-2 focus:ring-marketplace-brand/15"
            />
            <button
              type="submit"
              aria-label={t("searchThisShop")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-marketplace-muted-foreground hover:text-marketplace-foreground"
            >
              <Search className="size-4" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
