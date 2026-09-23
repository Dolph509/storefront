import type { Category } from "@spree/sdk";
import { connection } from "next/server";
import { cache, Suspense } from "react";
import { Footer, FooterCategoryLinks } from "@/components/layout/Footer";
import { Header, HeaderMobileMenu } from "@/components/layout/Header";
import { MarketplaceBottomNav } from "@/components/layout/MarketplaceBottomNav";
import { MarketplaceCategoryRow } from "@/components/layout/MarketplaceCategoryRow";
import {
  buildChromeContext,
  StorefrontThemeFooter,
  StorefrontThemeHeader,
  themeChromeActive,
} from "@/components/theme/StorefrontThemeChrome";
import { getCategories } from "@/lib/data/categories";
import { isWholesaleEnabled } from "@/lib/spree";
import { themeSectionGroupsEnabled } from "@/lib/theme/flags";
import { getActiveTheme } from "@/lib/theme/resolver";

interface StorefrontLayoutProps {
  children: React.ReactNode;
  params: Promise<{ country: string; locale: string }>;
}

interface StorefrontNavigationProps {
  basePath: string;
  country: string;
  locale: string;
}

const EMPTY_CATEGORIES: Category[] = [];

function MobileNavigationFallback() {
  return (
    <div
      aria-hidden="true"
      className="size-10 rounded-md bg-gray-100 animate-pulse motion-reduce:animate-none"
    />
  );
}

function FooterCategoryLinksFallback() {
  return (
    <li aria-hidden="true">
      <span className="block h-4 w-24 rounded bg-white/10 animate-pulse motion-reduce:animate-none" />
    </li>
  );
}

/**
 * Navigation categories are optional chrome, so defer their first load until
 * there is a real request instead of making every prerendered page contact the
 * Store API. Primitive arguments let React deduplicate category navigation
 * consumers within the request; successful responses keep using the persistent
 * cache in getCategories.
 */
const getRootCategories = cache(async (country: string, locale: string) => {
  await connection();

  return getCategories(
    {
      depth_eq: 0,
      expand: ["children.children"],
    },
    { country, locale },
  )
    .then((res) => res.data)
    .catch((error) => {
      console.error("StorefrontLayout: failed to load categories", error);
      return EMPTY_CATEGORIES;
    });
});

async function StorefrontMobileNavigation({
  basePath,
  country,
  locale,
}: StorefrontNavigationProps) {
  const rootCategories = await getRootCategories(country, locale);

  return (
    <HeaderMobileMenu rootCategories={rootCategories} basePath={basePath} />
  );
}

function StorefrontCategoryNavigation({
  basePath,
  locale,
}: StorefrontNavigationProps) {
  return (
    <MarketplaceCategoryRow basePath={basePath} locale={locale as Locale} />
  );
}

async function StorefrontBottomNavigation({
  basePath,
  country,
  locale,
}: StorefrontNavigationProps) {
  const rootCategories = await getRootCategories(country, locale);

  return (
    <MarketplaceBottomNav
      rootCategories={rootCategories}
      basePath={basePath}
      wholesaleEnabled={isWholesaleEnabled()}
    />
  );
}

async function StorefrontFooterCategoryLinks({
  basePath,
  country,
  locale,
}: StorefrontNavigationProps) {
  const rootCategories = await getRootCategories(country, locale);

  return (
    <FooterCategoryLinks rootCategories={rootCategories} basePath={basePath} />
  );
}

export default async function StorefrontLayout({
  children,
  params,
}: StorefrontLayoutProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const theme = themeSectionGroupsEnabled()
    ? await getActiveTheme().catch(() => null)
    : null;
  const chrome = themeChromeActive(theme);
  const chromeContext = buildChromeContext({ basePath, country, locale });
  const useThemeHeader = Boolean(theme && chrome.header);
  const useThemeFooter = Boolean(theme && chrome.footer);

  return (
    <>
      {useThemeHeader && theme ? (
        <StorefrontThemeHeader theme={theme} context={chromeContext} />
      ) : (
        <>
          <Header
            basePath={basePath}
            locale={locale as Locale}
            mobileNavigation={
              <Suspense fallback={<MobileNavigationFallback />}>
                <StorefrontMobileNavigation
                  basePath={basePath}
                  country={country}
                  locale={locale}
                />
              </Suspense>
            }
          />
          <Suspense fallback={null}>
            <div className="border-b border-[#e1e3df] bg-white py-2">
              <StorefrontCategoryNavigation
                basePath={basePath}
                country={country}
                locale={locale}
              />
            </div>
          </Suspense>
        </>
      )}
      <main className="flex-1">{children}</main>
      {useThemeFooter && theme ? (
        <StorefrontThemeFooter theme={theme} context={chromeContext} />
      ) : (
        <Footer
          basePath={basePath}
          locale={locale as Locale}
          categoryLinks={
            <Suspense fallback={<FooterCategoryLinksFallback />}>
              <StorefrontFooterCategoryLinks
                basePath={basePath}
                country={country}
                locale={locale}
              />
            </Suspense>
          }
        />
      )}
      <Suspense fallback={null}>
        <StorefrontBottomNavigation
          basePath={basePath}
          country={country}
          locale={locale}
        />
      </Suspense>
    </>
  );
}
