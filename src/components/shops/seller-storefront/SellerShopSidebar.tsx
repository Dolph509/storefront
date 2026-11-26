import {
  WandSparkles as CustomOrder,
  ShoppingBag as Sales,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ReportShopButton } from "@/components/shops/ReportShopButton";
import { ShopFollowersButton } from "@/components/shops/ShopFollowersButton";
import type { SellerShopSection } from "@/lib/data/seller-storefront-types";
import { sellerShopCatalogPath } from "@/lib/utils/seller-storefront";
import { SellerShopStat } from "./SellerShopStat";

interface SellerShopSidebarProps {
  slug: string;
  basePath: string;
  sections: SellerShopSection[];
  activeSection?: string;
  totalItemCount: number;
  salesCount?: number;
  followersCount?: number;
  customOrderHref?: string;
  shopPath: string;
  sellerId: string;
  sellerSlug: string;
  marketplaceName: string;
  minPrice?: string;
  maxPrice?: string;
}

export async function SellerShopSidebar({
  slug,
  basePath,
  sections,
  activeSection,
  totalItemCount,
  salesCount = 0,
  followersCount = 0,
  customOrderHref,
  shopPath,
  sellerId,
  sellerSlug,
  marketplaceName,
  minPrice,
  maxPrice,
}: SellerShopSidebarProps) {
  const t = await getTranslations("sellers");
  const productsPath = sellerShopCatalogPath(basePath, slug);

  const linkClass = (active: boolean) =>
    `flex min-h-8 items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
      active
        ? "bg-[#eee9ef] font-semibold text-[#452c4f]"
        : "text-[#59544e] hover:bg-[#f3efe8] hover:text-[#1a1916]"
    }`;

  const categoryLinks = (
    <ul className="space-y-0.5">
      <li>
        <a
          href={productsPath}
          className={linkClass(!activeSection)}
          aria-current={!activeSection ? "page" : undefined}
        >
          <span>{t("allSections")}</span>
          <span className="tabular-nums text-[#8a817a]">
            {totalItemCount.toLocaleString()}
          </span>
        </a>
      </li>
      <li>
        <a
          href={sellerShopCatalogPath(basePath, slug, { sale: "1" })}
          className={linkClass(false)}
        >
          <span>{t("onSaleTitle")}</span>
        </a>
      </li>
      <li>
        <a
          href={sellerShopCatalogPath(basePath, slug, { sort: "best_selling" })}
          className={linkClass(false)}
        >
          <span>{t("bestSellersTitle")}</span>
        </a>
      </li>
      <li>
        <a
          href={sellerShopCatalogPath(basePath, slug, { personalizable: "1" })}
          className={linkClass(false)}
        >
          <span>{t("personalizedTitle")}</span>
        </a>
      </li>
      {sections.map((item) => {
        const href = sellerShopCatalogPath(basePath, slug, {
          section: item.slug,
        });
        const active = activeSection === item.slug;
        return (
          <li key={item.id}>
            <a
              href={href}
              className={linkClass(active)}
              aria-current={active ? "page" : undefined}
            >
              <span className="min-w-0 truncate pr-2">{item.name}</span>
              {item.products_count != null ? (
                <span className="shrink-0 tabular-nums text-[#8a817a]">
                  {item.products_count.toLocaleString()}
                </span>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className="border-b border-[#e8e3da] pb-6 md:sticky md:top-16 md:self-start md:border-b-0 md:border-r md:border-[#e8e3da] md:pr-6">
      <nav aria-label={t("shopCategoriesLabel")} className="mb-4">
        <details className="group md:hidden" open>
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between border-y border-[#e8e3da] py-2 text-sm font-semibold text-[#1a1916] [&::-webkit-details-marker]:hidden">
            {t("shopProductsHeading")}
            <span aria-hidden className="text-[#8a817a] group-open:rotate-180">
              ⌄
            </span>
          </summary>
          <div className="max-h-64 overflow-y-auto py-2">{categoryLinks}</div>
        </details>
        <div className="hidden md:block">
          <h2 className="mb-3 font-display text-lg font-medium text-[#1a1916]">
            {t("shopProductsHeading")}
          </h2>
          <details className="group" open>
            <summary className="mb-2 flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#8a817a] [&::-webkit-details-marker]:hidden">
              {t("shopCategoriesLabel")}
              <span aria-hidden className="group-open:rotate-180">
                ⌄
              </span>
            </summary>
            {categoryLinks}
          </details>
        </div>
      </nav>

      <form
        method="get"
        action={`${basePath}/sellers/${slug}#shop-items`}
        className="mb-5 hidden space-y-2 border-t border-[#e8e3da] pt-4 md:block"
      >
        <input type="hidden" name="tab" value="home" />
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a817a]">
          {t("priceRangeLabel")}
        </p>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="seller-min-price">
            {t("filterMinPrice")}
          </label>
          <input
            id="seller-min-price"
            name="min_price"
            type="number"
            min="0"
            step="1"
            defaultValue={minPrice ?? ""}
            placeholder={t("filterMinPrice")}
            className="h-9 w-full rounded-md border border-[#e8e3da] bg-white px-2 text-sm text-[#1a1916] outline-none focus:border-[#452c4f] focus:ring-2 focus:ring-[#452c4f]/15"
          />
          <span className="text-[#8a817a]" aria-hidden>
            –
          </span>
          <label className="sr-only" htmlFor="seller-max-price">
            {t("filterMaxPrice")}
          </label>
          <input
            id="seller-max-price"
            name="max_price"
            type="number"
            min="0"
            step="1"
            defaultValue={maxPrice ?? ""}
            placeholder={t("filterMaxPrice")}
            className="h-9 w-full rounded-md border border-[#e8e3da] bg-white px-2 text-sm text-[#1a1916] outline-none focus:border-[#452c4f] focus:ring-2 focus:ring-[#452c4f]/15"
          />
        </div>
        <button
          type="submit"
          className="h-9 w-full rounded-full border border-[#452c4f] bg-white text-xs font-semibold text-[#452c4f] transition-colors hover:bg-[#eee9ef]"
        >
          {t("filterApply")}
        </button>
      </form>

      {customOrderHref ? (
        <div className="hidden border-t border-[#e8e3da] pt-4 md:block">
          <a
            href={customOrderHref}
            className="flex min-h-9 w-full min-w-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-[#452c4f] bg-white px-2.5 py-2 text-center text-xs font-medium leading-tight text-[#452c4f] transition-colors hover:bg-[#eee9ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#452c4f]"
          >
            <CustomOrder className="size-3.5 flex-shrink-0" aria-hidden />
            <span className="min-w-0 whitespace-normal break-words">
              {t("requestCustomOrder")}
            </span>
          </a>
        </div>
      ) : null}

      <dl className="mt-4 hidden space-y-2 border-t border-[#e8e3da] pt-4 text-sm text-[#59544e] md:block">
        <div className="flex justify-between gap-2">
          <dt>
            <SellerShopStat icon={Sales}>{t("sidebarSales")}</SellerShopStat>
          </dt>
          <dd className="font-medium tabular-nums text-[#1a1916]">
            {salesCount.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{t("sidebarFollowers")}</dt>
          <dd>
            <ShopFollowersButton
              sellerIdOrSlug={sellerSlug}
              followersCount={followersCount}
              label={t("sidebarFollowers")}
              variant="sidebar"
            />
          </dd>
        </div>
      </dl>

      <div className="mt-5 hidden border-t border-[#e8e3da] pt-3 md:block">
        <ReportShopButton
          sellerId={sellerId}
          marketplaceName={marketplaceName}
          variant="sidebar"
        />
      </div>

      <nav
        aria-label={t("shopNavLabel")}
        className="mt-4 hidden border-t border-[#e8e3da] pt-3 md:block"
      >
        <ul className="space-y-1">
          <li>
            <a href={`${shopPath}#shop-reviews`} className={linkClass(false)}>
              {t("tab_reviews")}
            </a>
          </li>
          <li>
            <a href={`${shopPath}#shop-about`} className={linkClass(false)}>
              {t("tab_about_studio")}
            </a>
          </li>
          <li>
            <a href={`${shopPath}#shop-policies`} className={linkClass(false)}>
              {t("tab_policies")}
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
