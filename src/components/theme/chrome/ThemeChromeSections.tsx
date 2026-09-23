import type { Category } from "@spree/sdk";
import Link from "next/link";
import { Suspense } from "react";
import { Footer, FooterCategoryLinks } from "@/components/layout/Footer";
import { Header, HeaderMobileMenu } from "@/components/layout/Header";
import { MarketplaceCategoryRow } from "@/components/layout/MarketplaceCategoryRow";
import { getCategories } from "@/lib/data/categories";
import { resolveThemeSetting } from "@/lib/theme/dynamic-source";
import type {
  ThemeRenderContext,
  ThemeSectionInstance,
} from "@/lib/theme/types";

function boolSetting(
  settings: Record<string, unknown>,
  key: string,
  defaultValue: boolean,
): boolean {
  const value = settings[key];
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return defaultValue;
}

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

async function loadRootCategories(
  country: string,
  locale: string,
): Promise<Category[]> {
  try {
    const response = await getCategories(
      { depth_eq: 0, expand: ["children.children"] },
      { country, locale },
    );
    return response.data ?? [];
  } catch {
    return [];
  }
}

export function ThemeAnnouncementSection({
  section,
  context,
}: {
  section: ThemeSectionInstance;
  context: ThemeRenderContext;
}) {
  const settings = section.settings || {};
  const text = String(resolveThemeSetting(settings.text, context, ""));
  const link = typeof settings.link === "string" ? settings.link : "";
  const style = settings.style === "accent" ? "accent" : "default";
  if (!text) return null;

  const className =
    style === "accent"
      ? "bg-marketplace-brand text-white text-center text-sm py-2 px-4"
      : "bg-[#f5f5f1] text-[#222] text-center text-sm py-2 px-4 border-b border-[#e1e3df]";

  const body = <span>{text}</span>;
  return (
    <div className={className} data-theme-section-type="announcement_bar">
      {link ? (
        <Link
          href={link.startsWith("/") ? link : `/${link}`}
          className="underline-offset-2 hover:underline"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

export async function ThemeHeaderSection({
  section,
  context,
}: {
  section: ThemeSectionInstance;
  context: ThemeRenderContext;
}) {
  const settings = section.settings || {};
  const showCategoryRow = boolSetting(settings, "show_category_row", true);
  const sticky = boolSetting(settings, "sticky", true);
  const rootCategories = await loadRootCategories(
    context.country,
    context.locale,
  );

  return (
    <div
      data-theme-section-type="theme_header"
      className={sticky ? undefined : "relative"}
    >
      <Header
        basePath={context.basePath}
        locale={context.locale as Locale}
        mobileNavigation={
          <Suspense fallback={<MobileNavigationFallback />}>
            <HeaderMobileMenu
              rootCategories={rootCategories}
              basePath={context.basePath}
            />
          </Suspense>
        }
      />
      {showCategoryRow ? (
        <div className="border-b border-[#e1e3df] bg-white py-2">
          <MarketplaceCategoryRow
            basePath={context.basePath}
            locale={context.locale as Locale}
          />
        </div>
      ) : null}
    </div>
  );
}

export async function ThemeFooterSection({
  context,
}: {
  section: ThemeSectionInstance;
  context: ThemeRenderContext;
}) {
  const rootCategories = await loadRootCategories(
    context.country,
    context.locale,
  );

  return (
    <div data-theme-section-type="theme_footer">
      <Footer
        basePath={context.basePath}
        locale={context.locale as Locale}
        categoryLinks={
          <Suspense fallback={<FooterCategoryLinksFallback />}>
            <FooterCategoryLinks
              rootCategories={rootCategories}
              basePath={context.basePath}
            />
          </Suspense>
        }
      />
    </div>
  );
}
