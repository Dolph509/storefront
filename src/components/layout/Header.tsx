import type { Category } from "@spree/sdk";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { MarketplaceHeaderActions } from "@/components/layout/MarketplaceHeaderActions";
import { MarketplacePromoBar } from "@/components/layout/MarketplacePromoBar";
import { StoreBrandLogo } from "@/components/layout/StoreBrandLogo";
import { SearchBar } from "@/components/search/SearchBar";
import { isWholesaleEnabled } from "@/lib/spree";

const LazyMobileMenu = dynamic(
  () =>
    import("@/components/layout/MobileMenu").then((mod) => ({
      default: mod.MobileMenu,
    })),
  {
    loading: () => (
      <div className="inline-flex items-center justify-center h-10 w-10" />
    ),
  },
);

interface HeaderProps {
  basePath: string;
  locale: Locale;
  mobileNavigation: ReactNode;
}

interface HeaderMobileMenuProps {
  rootCategories: Category[];
  basePath: string;
}

export function HeaderMobileMenu({
  rootCategories,
  basePath,
}: HeaderMobileMenuProps) {
  return (
    <LazyMobileMenu
      rootCategories={rootCategories}
      basePath={basePath}
      wholesaleEnabled={isWholesaleEnabled()}
    />
  );
}

export async function Header({
  basePath,
  locale,
  mobileNavigation,
}: HeaderProps) {
  await getTranslations({ locale, namespace: "header" });

  return (
    <header className="sticky top-0 z-50 bg-white text-[#222]">
      <MarketplacePromoBar basePath={basePath} locale={locale} />
      <div className="border-b border-[#e1e3df]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-2 sm:gap-4 sm:py-3 lg:px-6">
          <div className="flex shrink-0 items-center gap-1">
            <div className="md:hidden">{mobileNavigation}</div>
            <StoreBrandLogo basePath={basePath} compact appearance="etsy" />
          </div>

          <search className="hidden min-w-0 flex-1 md:block lg:max-w-3xl lg:mx-auto">
            <SearchBar basePath={basePath} appearance="etsy" />
          </search>

          <div className="ml-auto">
            <MarketplaceHeaderActions basePath={basePath} variant="etsy" />
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 pb-3 md:hidden">
          <SearchBar basePath={basePath} appearance="etsy" />
        </div>
      </div>
    </header>
  );
}
