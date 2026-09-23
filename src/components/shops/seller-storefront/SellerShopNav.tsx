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
      className="border-b border-[#e8e3df] bg-white"
    >
      <div className={sellerShopShellClass}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <ul className="-mb-px flex gap-6 overflow-x-auto scrollbar-none sm:gap-8">
            {TABS.map((tab) => {
              const isActive = current === tab;
              const href = sellerShopPath(basePath, slug, tab);
              return (
                <li key={tab} className="shrink-0">
                  <Link
                    href={href}
                    className={`inline-block border-b-2 py-3 text-sm transition-colors ${
                      isActive
                        ? "border-[#222] font-semibold text-[#222]"
                        : "border-transparent font-normal text-[#595959] hover:text-[#222]"
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
            className="relative mb-3 w-full shrink-0 sm:mb-0 sm:w-64"
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
              className="h-9 w-full rounded-full border border-[#ddd6d2] bg-[#faf8f7] py-1.5 pl-4 pr-10 text-sm text-[#222] placeholder:text-[#74706d] focus:border-[#222] focus:outline-none"
            />
            <button
              type="submit"
              aria-label={t("searchThisShop")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4947]"
            >
              <Search className="size-4" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
