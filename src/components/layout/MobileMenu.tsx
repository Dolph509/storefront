"use client";

import type { Category } from "@spree/sdk";
import { ChevronLeft, ChevronRight, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { SpreeIcon } from "@/components/icons";
import { CmsNavigationIcon } from "@/components/layout/CmsNavigationIcon";
import { RegionPreferences } from "@/components/layout/RegionPreferences";
import { Button } from "@/components/ui/button";
import { CategoryImage } from "@/components/ui/category-image";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { cmsNavigationHref } from "@/lib/cms-navigation-href";
import type {
  CmsNavigationItem,
  CmsNavigationPayload,
} from "@/lib/data/cms-navigation";
import { marketplaceEtsyPillLinkClass } from "@/lib/marketplace-etsy-motion";
import { getCollectionStockImage } from "@/lib/marketplace-stock-images";
import { getStoreName } from "@/lib/store";
import { themeSettingEnabled } from "@/lib/theme/setting-value";

type PanelType =
  | { kind: "main" }
  | { kind: "category"; category: Category }
  | { kind: "cms"; item: CmsNavigationItem };

interface MobileMenuProps {
  rootCategories: Category[];
  basePath: string;
  /** Whether the wholesale addon is enabled — gates the trade portal link. */
  wholesaleEnabled: boolean;
  triggerVariant?: "icon" | "bottom-nav";
  accordionNavigation?: boolean;
  showNavigationBar?: boolean;
  showDividers?: boolean;
  menuBackgroundColor?: string;
  menuTextColor?: string;
  cmsItems?: CmsNavigationItem[];
  cmsSettings?: CmsNavigationPayload["settings"];
  forYouCategoryIds?: string[];
}

function BrandEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2.5L21.5 12L12 21.5L2.5 12L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" fill="var(--marketplace-brand-accent)" />
    </svg>
  );
}

export function MobileMenu({
  rootCategories,
  basePath,
  wholesaleEnabled: _wholesaleEnabled,
  triggerVariant = "icon",
  accordionNavigation: accordionNavigationSetting,
  showNavigationBar = false,
  showDividers = false,
  menuBackgroundColor,
  menuTextColor,
  cmsItems = [],
  cmsSettings,
  forYouCategoryIds = [],
}: MobileMenuProps) {
  const t = useTranslations("header");
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { navigation } = useStoreThemeSettings();
  const storeName = getStoreName();
  const accordionNavigation =
    themeSettingEnabled(accordionNavigationSetting) ||
    navigation?.mobile_style === "accordion";
  const [open, setOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [panelStack, setPanelStack] = useState<PanelType[]>([{ kind: "main" }]);
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentPanel = panelStack[panelStack.length - 1];
  const categoryIndex = new Map<string, Category>();
  const categoryList: Category[] = [];
  const indexCategories = (categories: Category[]) => {
    for (const category of categories) {
      categoryList.push(category);
      categoryIndex.set(category.id, category);
      categoryIndex.set(category.permalink, category);
      indexCategories(category.children || []);
    }
  };
  indexCategories(rootCategories);

  const resolveMenuCategory = (item: CmsNavigationItem) => {
    if (item.category_id) {
      const category = categoryIndex.get(item.category_id);
      if (category) return category;
    }
    const targetPermalink = item.target?.match(/\/c\/([^/?#]+)/)?.[1];
    if (targetPermalink) {
      const category = categoryIndex.get(decodeURIComponent(targetPermalink));
      if (category) return category;
    }
    const normalize = (value: string) =>
      value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
    const label = normalize(item.label);
    return categoryList.find(
      (category) =>
        normalize(category.name) === label ||
        normalize(
          category.permalink.split("/").at(-1) || category.permalink,
        ) === label,
    );
  };

  const cmsHref = (item: CmsNavigationItem) => {
    if (item.type === "category") {
      const category = item.category_id
        ? categoryIndex.get(item.category_id)
        : undefined;
      return category ? `${basePath}/c/${category.permalink}` : null;
    }
    return cmsNavigationHref(item, basePath);
  };

  const pickDistinctStockImage = (
    index: number,
    hint: string,
    usedImages: Set<string>,
  ) => {
    const primary = getCollectionStockImage(index, hint);
    if (!usedImages.has(primary)) {
      usedImages.add(primary);
      return primary;
    }
    for (let offset = 1; offset <= 6; offset += 1) {
      const candidate = getCollectionStockImage(index + offset);
      if (!usedImages.has(candidate)) {
        usedImages.add(candidate);
        return candidate;
      }
    }
    return primary;
  };

  const cancelPendingCallbacks = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const pushPanel = (panel: PanelType) => {
    cancelPendingCallbacks();
    flushSync(() => {
      setPanelStack((prev) => [...prev, panel]);
    });
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setAnimatedIndex((prev) => prev + 1);
    });
  };

  const popPanel = () => {
    cancelPendingCallbacks();
    setAnimatedIndex((prev) => Math.max(0, prev - 1));
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setPanelStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    }, 300);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      cancelPendingCallbacks();
      setPanelStack([{ kind: "main" }]);
      setAnimatedIndex(0);
      setSearchQuery("");
    }
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    handleOpenChange(false);
    router.push(`${basePath}/products?q=${encodeURIComponent(query)}`);
  };

  const linkClass = `flex min-h-11 items-center text-left text-[#1a1a1a] hover:text-[#1b4332] hover:bg-marketplace-accent px-4 py-2.5 text-[15px] transition-colors ${showDividers ? "border-b border-[#eae7e2] rounded-none" : "rounded-lg"}`;

  const categoryButtonClass = `flex min-h-12 w-full items-center justify-between gap-3 text-left text-[#1a1a1a] hover:text-[#1b4332] hover:bg-marketplace-accent px-4 py-3 text-[15px] font-medium transition-colors ${showDividers ? "border-b border-[#eae7e2] rounded-none" : "rounded-lg"}`;

  const renderAccordionCategory = (
    category: Category,
    depth = 0,
  ): React.ReactNode => (
    <details
      key={category.id}
      className="group"
      style={{ marginLeft: `${Math.min(depth, 4) * 12}px` }}
    >
      <summary className={categoryButtonClass}>
        {category.name}
        <ChevronRight
          className="size-4 rotate-90 text-[#8c8780] transition-transform group-open:-rotate-90"
          aria-hidden
        />
      </summary>
      <div className="flex flex-col gap-0.5 border-l border-[#eae7e2] pl-2">
        <Link
          href={`${basePath}/c/${category.permalink}`}
          onClick={() => handleOpenChange(false)}
          className={linkClass}
        >
          View {category.name}
        </Link>
        {category.children?.map((child) =>
          child.children?.length ? (
            renderAccordionCategory(child, depth + 1)
          ) : (
            <Link
              key={child.id}
              href={`${basePath}/c/${child.permalink}`}
              onClick={() => handleOpenChange(false)}
              className={linkClass}
            >
              {child.name}
            </Link>
          ),
        )}
      </div>
    </details>
  );

  const activePanelTitle =
    currentPanel.kind === "category"
      ? currentPanel.category.name
      : currentPanel.kind === "cms"
        ? currentPanel.item.label
        : "";

  const usedCategoryFallbackImages = new Set<string>();
  const enabledCmsItems = cmsItems.filter((item) => item.enabled !== false);
  const firstName = user?.first_name?.trim() || null;
  const accountLabel = isAuthenticated
    ? firstName
      ? t("helloName", { name: firstName })
      : t("myAccount")
    : t("signIn");

  const categoryRowClass =
    "flex min-h-[64px] w-full cursor-pointer items-center gap-3.5 px-4 py-2.5 text-left text-[#1a1a1a] transition-colors hover:bg-marketplace-accent active:bg-marketplace-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1b4332]";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="ghost"
        size={triggerVariant === "icon" ? "icon" : "default"}
        onClick={() => {
          if (!hasInteracted) setHasInteracted(true);
          setOpen(!open);
        }}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-current={
          triggerVariant === "bottom-nav" && open ? "page" : undefined
        }
        className={
          triggerVariant === "bottom-nav"
            ? "relative z-[60] h-16 min-w-0 flex-col gap-0.5 rounded-none px-1 text-[10px] font-medium text-marketplace-muted-foreground hover:bg-marketplace-accent hover:text-marketplace-brand"
            : "relative z-[60] h-9 w-9 cursor-pointer sm:h-10 sm:w-10"
        }
      >
        {triggerVariant === "bottom-nav" ? (
          <>
            <SpreeIcon name="categories" className="size-5" />
            <span>{t("browse")}</span>
          </>
        ) : (
          <div className="relative h-5 w-5">
            <span
              className={`absolute left-0 right-0 top-[2px] h-0.5 rounded-full bg-current ${
                hasInteracted
                  ? open
                    ? "animate-hamburger-top-open"
                    : "animate-hamburger-top-close"
                  : ""
              }`}
            />
            <span
              className={`absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current ${
                hasInteracted
                  ? open
                    ? "animate-hamburger-mid-open"
                    : "animate-hamburger-mid-close"
                  : ""
              }`}
              style={
                hasInteracted && !open
                  ? { animationDelay: "0.2s", opacity: 0 }
                  : undefined
              }
            />
            <span
              className={`absolute bottom-[2px] left-0 right-0 h-0.5 rounded-full bg-current ${
                hasInteracted
                  ? open
                    ? "animate-hamburger-bottom-open"
                    : "animate-hamburger-bottom-close"
                  : ""
              }`}
            />
          </div>
        )}
      </Button>

      <SheetContent
        data-theme-mobile-menu
        side="left"
        className="flex h-full w-[min(100vw,420px)] max-w-[420px] flex-col !gap-0 overflow-hidden !rounded-none border-r border-[#eae7e2] bg-[#fffcf8] text-[#1a1a1a] shadow-2xl motion-reduce:animate-none!"
        showCloseButton={false}
        overlayClassName="bg-black/40 backdrop-blur-[1.5px]"
        style={{ backgroundColor: menuBackgroundColor, color: menuTextColor }}
      >
        <SheetTitle className="sr-only">{t("menu")}</SheetTitle>

        <div
          className="relative flex h-14 shrink-0 items-center justify-between border-b border-[#ece8e1] px-4"
          style={{ backgroundColor: menuBackgroundColor, color: menuTextColor }}
        >
          {currentPanel.kind === "main" ? (
            <div className="flex min-w-0 items-center gap-2.5">
              <BrandEmblem className="size-[18px] shrink-0 text-[#1b4332]" />
              <div className="min-w-0">
                <p className="truncate font-display text-[18px] font-medium leading-none tracking-[-0.02em] text-[#1b4332]">
                  {storeName}
                </p>
                <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a847c]">
                  {t("browse")}
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={popPanel}
              className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:text-[#1b4332]"
            >
              <ChevronLeft className="size-5 shrink-0" aria-hidden />
              <span className="truncate">{activePanelTitle}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            aria-label={t("closeMenu")}
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-[#4a4743] transition-colors hover:bg-marketplace-accent hover:text-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div
            className={`absolute inset-0 flex flex-col bg-[#fffcf8] transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
              animatedIndex === 0 && currentPanel.kind === "main"
                ? "translate-x-0"
                : "-translate-x-full"
            }`}
            style={{
              backgroundColor: menuBackgroundColor,
              color: menuTextColor,
            }}
          >
            <nav
              data-theme-mobile-menu-scroll
              className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-5"
              style={{
                backgroundColor: menuBackgroundColor,
                color: menuTextColor,
              }}
            >
              <div className="border-b border-[#ece8e1] px-4 py-3.5">
                <Link
                  href={`${basePath}/account`}
                  onClick={() => handleOpenChange(false)}
                  className="flex min-h-[52px] items-center gap-3 rounded-2xl bg-[#f4f0e9] px-3.5 text-[#1a1a1a] transition-colors hover:bg-marketplace-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#1b4332] shadow-sm ring-1 ring-black/5">
                    <UserRound className="size-[18px]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">
                      {accountLabel}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-[#6f6c68]">
                      {isAuthenticated ? t("myAccount") : t("promoMessage")}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-[#9a948c]"
                    aria-hidden
                  />
                </Link>

                <form onSubmit={submitSearch} className="mt-3">
                  <label className="relative block">
                    <span className="sr-only">{t("searchMarketplace")}</span>
                    <Search
                      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6f6c68]"
                      aria-hidden
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={t("searchMarketplace")}
                      className="h-11 w-full rounded-full border border-[#e2ddd4] bg-white pl-10 pr-4 text-[14px] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#8a847c] focus:border-[#1b4332] focus:ring-2 focus:ring-[#1b4332]/15"
                    />
                  </label>
                </form>
              </div>

              {enabledCmsItems.length > 0 ? (
                <section
                  aria-labelledby="mobile-menu-categories"
                  className="mt-4"
                >
                  <h2
                    id="mobile-menu-categories"
                    className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a847c]"
                  >
                    {t("shopByCategory")}
                  </h2>
                  <div className="divide-y divide-[#f0ebe3]">
                    {enabledCmsItems.map((item, index) => {
                      const href = cmsHref(item);
                      const category = resolveMenuCategory(item);
                      const panelImageUrl = item.featured_panels?.find(
                        (panel) =>
                          panel.mobile_visible !== false && panel.image_url,
                      )?.image_url;
                      const imageUrl =
                        category?.square_image_url ||
                        category?.image_url ||
                        panelImageUrl ||
                        pickDistinctStockImage(
                          index,
                          item.label,
                          usedCategoryFallbackImages,
                        );
                      const rowImage = (
                        <CategoryImage
                          key={item.id}
                          src={imageUrl}
                          alt=""
                          width={48}
                          height={48}
                          className="size-12 shrink-0 rounded-[12px] object-cover ring-1 ring-black/5"
                          sizes="48px"
                        />
                      );
                      return item.children?.length ? (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => pushPanel({ kind: "cms", item })}
                          className={categoryRowClass}
                        >
                          {rowImage}
                          <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                            {item.label}
                          </span>
                          <ChevronRight
                            className="size-4 shrink-0 text-[#9a948c]"
                            aria-hidden
                          />
                        </button>
                      ) : href ? (
                        <Link
                          key={item.id}
                          href={href}
                          onClick={() => handleOpenChange(false)}
                          className={categoryRowClass}
                        >
                          {rowImage}
                          <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                            {item.label}
                          </span>
                          <ChevronRight
                            className="size-4 shrink-0 text-[#9a948c]"
                            aria-hidden
                          />
                        </Link>
                      ) : null;
                    })}
                  </div>
                </section>
              ) : rootCategories.length ? (
                <section
                  aria-labelledby="mobile-menu-categories"
                  className="mt-4"
                >
                  <h2
                    id="mobile-menu-categories"
                    className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a847c]"
                  >
                    {t("shopByCategory")}
                  </h2>
                  <div className="divide-y divide-[#f0ebe3]">
                    {rootCategories.map((category, index) =>
                      accordionNavigation && category.children?.length ? (
                        renderAccordionCategory(category)
                      ) : category.children && category.children.length > 0 ? (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            pushPanel({ kind: "category", category })
                          }
                          className={categoryRowClass}
                        >
                          <CategoryImage
                            src={
                              category.square_image_url ||
                              category.image_url ||
                              pickDistinctStockImage(
                                index,
                                category.name,
                                usedCategoryFallbackImages,
                              )
                            }
                            alt=""
                            width={48}
                            height={48}
                            className="size-12 shrink-0 rounded-[12px] object-cover ring-1 ring-black/5"
                            sizes="48px"
                          />
                          <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                            {category.name}
                          </span>
                          <ChevronRight
                            className="size-4 shrink-0 text-[#9a948c]"
                            aria-hidden
                          />
                        </button>
                      ) : (
                        <Link
                          key={category.id}
                          href={`${basePath}/c/${category.permalink}`}
                          onClick={() => handleOpenChange(false)}
                          className={categoryRowClass}
                        >
                          <CategoryImage
                            src={
                              category.square_image_url ||
                              category.image_url ||
                              pickDistinctStockImage(
                                index,
                                category.name,
                                usedCategoryFallbackImages,
                              )
                            }
                            alt=""
                            width={48}
                            height={48}
                            className="size-12 shrink-0 rounded-[12px] object-cover ring-1 ring-black/5"
                            sizes="48px"
                          />
                          <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                            {category.name}
                          </span>
                          <ChevronRight
                            className="size-4 shrink-0 text-[#9a948c]"
                            aria-hidden
                          />
                        </Link>
                      ),
                    )}
                  </div>
                </section>
              ) : null}

              {cmsSettings?.show_for_you && forYouCategoryIds.length ? (
                <section className="mt-5 border-t border-[#ece8e1] pt-4">
                  <p className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a847c]">
                    {t("forYou")}
                  </p>
                  {forYouCategoryIds
                    .map((id) => categoryIndex.get(id))
                    .filter((category): category is Category =>
                      Boolean(category),
                    )
                    .map((category) => (
                      <Link
                        key={category.id}
                        href={`${basePath}/c/${category.permalink}`}
                        onClick={() => handleOpenChange(false)}
                        className={linkClass}
                      >
                        {category.name}
                      </Link>
                    ))}
                </section>
              ) : null}

              {cmsSettings?.search_shortcuts?.length ? (
                <section className="mt-5 border-t border-[#ece8e1] px-4 pt-4">
                  <p className="pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a847c]">
                    {t("exploreSearches")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cmsSettings.search_shortcuts.map((shortcut) => (
                      <Link
                        key={shortcut.id}
                        href={`${basePath}/products?q=${encodeURIComponent(shortcut.query)}`}
                        onClick={() => handleOpenChange(false)}
                        className="inline-flex items-center rounded-full bg-[#f1eee8] px-3.5 py-1.5 text-[13px] font-medium text-[#1a1a1a] transition-colors hover:bg-marketplace-accent"
                      >
                        {shortcut.label}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </nav>

            {showNavigationBar && rootCategories.length > 0 && (
              <nav
                aria-label={t("categoryNavigation")}
                data-theme-mobile-navigation-bar
                className="flex shrink-0 gap-2 overflow-x-auto border-t border-[#eae7e2] px-3 py-2.5 md:hidden"
                style={{
                  backgroundColor: menuBackgroundColor,
                  color: menuTextColor,
                }}
              >
                {rootCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`${basePath}/c/${category.permalink}`}
                    onClick={() => handleOpenChange(false)}
                    className={`${marketplaceEtsyPillLinkClass} text-xs`}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            )}

            <SheetFooter className="items-center gap-2 border-t border-[#ece8e1] bg-[#f7f4ef] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)_+_0.75rem)] lg:hidden">
              <RegionPreferences variant="menu" />
            </SheetFooter>
          </div>

          {!accordionNavigation &&
            panelStack.map((panel, index) => {
              if (panel.kind === "main") return null;
              const isAnimatedIn = index <= animatedIndex;
              let translateClass = "translate-x-full";
              if (isAnimatedIn && index < panelStack.length - 1)
                translateClass = "-translate-x-full";
              else if (isAnimatedIn) translateClass = "translate-x-0";

              return (
                <div
                  key={`${panel.kind}-${panel.kind === "category" ? panel.category.id : panel.item.id}-${index}`}
                  className={`absolute inset-0 flex flex-col bg-[#fffcf8] transition-transform duration-300 ease-in-out ${translateClass}`}
                  style={{
                    backgroundColor: menuBackgroundColor,
                    color: menuTextColor,
                  }}
                >
                  {panel.kind === "category" ? (
                    <nav
                      data-theme-mobile-menu-scroll
                      className="flex flex-1 flex-col divide-y divide-[#f0ebe3] overflow-y-auto px-2 py-2"
                    >
                      {panel.category.children?.map((child) =>
                        child.children && child.children.length > 0 ? (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() =>
                              pushPanel({ kind: "category", category: child })
                            }
                            className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-medium text-[#1a1a1a] transition-colors hover:bg-marketplace-accent hover:text-[#1b4332]"
                          >
                            <span>{child.name}</span>
                            <ChevronRight
                              className="size-4 text-[#9a948c]"
                              aria-hidden
                            />
                          </button>
                        ) : (
                          <Link
                            key={child.id}
                            href={`${basePath}/c/${child.permalink}`}
                            onClick={() => handleOpenChange(false)}
                            className="flex min-h-12 items-center rounded-lg px-3 py-3 text-[15px] text-[#1a1a1a] transition-colors hover:bg-marketplace-accent hover:text-[#1b4332]"
                          >
                            {child.name}
                          </Link>
                        ),
                      )}
                    </nav>
                  ) : (
                    <nav
                      data-theme-mobile-menu-scroll
                      className="flex flex-1 flex-col divide-y divide-[#f0ebe3] overflow-y-auto px-2 py-2"
                    >
                      {panel.item.children
                        ?.filter((item) => item.enabled !== false)
                        .map((item) => {
                          const href = cmsHref(item);
                          return href ? (
                            <Link
                              key={item.id}
                              href={href}
                              onClick={() => handleOpenChange(false)}
                              className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-[15px] text-[#1a1a1a] transition-colors hover:bg-marketplace-accent hover:text-[#1b4332]"
                            >
                              <CmsNavigationIcon
                                name={item.icon}
                                className="size-4 shrink-0 text-[#6f6c68]"
                              />
                              <span>{item.label}</span>
                            </Link>
                          ) : null;
                        })}
                    </nav>
                  )}

                  <div className="border-t border-[#ece8e1] bg-[#f7f4ef] px-4 py-3 pb-[calc(env(safe-area-inset-bottom)_+_0.75rem)]">
                    <Link
                      href={
                        panel.kind === "category"
                          ? `${basePath}/c/${panel.category.permalink}`
                          : cmsHref(panel.item) || `${basePath}/products`
                      }
                      onClick={() => handleOpenChange(false)}
                      className="flex h-11 w-full items-center justify-center rounded-full border border-[#1b4332] bg-white text-[14px] font-semibold text-[#1b4332] transition-colors hover:bg-marketplace-accent"
                    >
                      {panel.kind === "category"
                        ? t("viewAllCategory", {
                            category: panel.category.name,
                          })
                        : t("viewAllCategory", { category: panel.item.label })}
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
