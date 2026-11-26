import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import type { SellerStorefrontTab } from "@/lib/data/seller-storefront-types";
import {
  sellerShopPath,
  sellerShopShellClass,
} from "@/lib/utils/seller-storefront";

interface SellerShopNavProps {
  slug: string;
  basePath: string;
  activeTab: SellerStorefrontTab;
  accentColor?: string | null;
  /** When true, render in-page hash links for the home scroll. */
  homeAnchors?: boolean;
  showProcess?: boolean;
  shopPath?: string;
}

type NavItem = {
  key: string;
  href: string;
  labelKey: string;
  active: boolean;
};

export async function SellerShopNav({
  slug,
  basePath,
  activeTab,
  accentColor,
  homeAnchors = false,
  showProcess = false,
  shopPath,
}: SellerShopNavProps) {
  const t = await getTranslations("sellers");
  const homePath = shopPath ?? `${basePath}/sellers/${slug}`;

  const items: NavItem[] = homeAnchors
    ? [
        {
          key: "shop",
          href: `${homePath}#shop-items`,
          labelKey: "tab_shop",
          active: true,
        },
        {
          key: "about",
          href: `${homePath}#shop-about`,
          labelKey: "tab_about_studio",
          active: false,
        },
        ...(showProcess
          ? [
              {
                key: "process",
                href: `${homePath}#shop-process`,
                labelKey: "tab_process",
                active: false,
              },
            ]
          : []),
        {
          key: "reviews",
          href: `${homePath}#shop-reviews`,
          labelKey: "tab_reviews",
          active: false,
        },
      ]
    : (
        [
          ["home", "tab_shop"],
          ["reviews", "tab_reviews"],
          ["about", "tab_about_studio"],
          ["policies", "tab_policies"],
        ] as const
      ).map(([tab, labelKey]) => ({
        key: tab,
        href: sellerShopPath(basePath, slug, tab),
        labelKey,
        active: activeTab === tab,
      }));

  return (
    <nav
      aria-label={t("shopNavLabel")}
      className="sticky top-0 z-30 border-b border-[#e8e3da] bg-[#faf8f5]/95 backdrop-blur-sm"
      data-theme-seller-nav
    >
      <div
        className={sellerShopShellClass}
        style={
          accentColor
            ? ({ "--shop-nav-accent": accentColor } as CSSProperties)
            : ({ "--shop-nav-accent": "#452c4f" } as CSSProperties)
        }
      >
        <ul className="-mb-px flex gap-5 overflow-x-auto scrollbar-none sm:gap-7">
          {items.map((item) => (
            <li key={item.key} className="shrink-0">
              <Link
                href={item.href}
                className={`inline-block border-b-2 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marketplace-brand ${
                  item.active
                    ? "border-[var(--shop-nav-accent,#452c4f)] font-semibold text-marketplace-foreground"
                    : "border-transparent font-medium text-marketplace-muted-foreground hover:text-marketplace-foreground"
                }`}
                aria-current={item.active ? "page" : undefined}
              >
                {t(item.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
