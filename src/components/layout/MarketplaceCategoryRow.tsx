"use client";

import type { Category } from "@spree/sdk";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryImage } from "@/components/ui/category-image";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { cmsNavigationHref } from "@/lib/cms-navigation-href";
import type {
  CmsNavigationFeaturedPanel,
  CmsNavigationItem,
} from "@/lib/data/cms-navigation";

interface MarketplaceCategoryRowProps {
  basePath: string;
  categories: Category[];
  menuItems?: CmsNavigationItem[];
  menuKey?: string;
  menuSettings?: {
    show_for_you?: boolean;
    search_shortcuts?: Array<{ id: string; label: string; query: string }>;
  };
  forYouCategoryIds?: string[];
}

interface MenuEntry {
  id: string;
  label: string;
  href: string | null;
  category?: Category;
  children?: CmsNavigationItem[];
  featuredPanels?: CmsNavigationFeaturedPanel[];
  external?: boolean;
}

function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ]);
}

function safeCmsHref(
  item: CmsNavigationItem,
  basePath: string,
  categories?: Map<string, Category>,
) {
  if (item.type === "category" && categories) {
    const category = item.category_id
      ? categories.get(item.category_id)
      : undefined;
    return category ? `${basePath}/c/${category.permalink}` : null;
  }
  const href = cmsNavigationHref(item, basePath);
  if (!href) return null;
  if (item.type === "external_link") {
    return /^https?:\/\//i.test(href) ? href : null;
  }
  return href;
}

function CategoryBranch({
  category,
  basePath,
  depth = 0,
  onNavigate,
}: {
  category: Category;
  basePath: string;
  depth?: number;
  onNavigate: () => void;
}) {
  const children = category.children ?? [];
  const href = `${basePath}/c/${category.permalink}`;

  return (
    <li className={depth > 0 ? "mt-2" : ""}>
      <Link
        href={href}
        onClick={onNavigate}
        className={
          depth === 0
            ? "group flex items-center gap-2 rounded-sm py-1.5 text-sm font-semibold text-marketplace-foreground hover:text-marketplace-brand"
            : "inline-flex items-center gap-1 py-1 text-sm text-marketplace-muted-foreground hover:text-marketplace-foreground"
        }
      >
        {depth === 0 && category.image_url ? (
          <CategoryImage
            src={category.square_image_url || category.image_url}
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-sm object-cover"
            sizes="32px"
          />
        ) : null}
        <span className="line-clamp-2">{category.name}</span>
        {depth > 0 && children.length ? (
          <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
        ) : null}
      </Link>
      {children.length ? (
        <ul
          className={
            depth === 0
              ? "ml-1 border-l border-marketplace-border pl-3"
              : "ml-3 border-l border-marketplace-border-subtle pl-3"
          }
        >
          {children.map((child) => (
            <CategoryBranch
              key={child.id}
              category={child}
              basePath={basePath}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CmsItemList({
  items,
  basePath,
  categoryIndex,
  onNavigate,
}: {
  items: CmsNavigationItem[];
  basePath: string;
  categoryIndex: Map<string, Category>;
  onNavigate: () => void;
}) {
  return (
    <ul className="space-y-1">
      {items
        .filter((item) => item.enabled !== false)
        .map((item) => {
          const href = safeCmsHref(item, basePath, categoryIndex);
          if (!href) return null;
          return (
            <li key={item.id}>
              <Link
                href={href}
                onClick={onNavigate}
                target={item.type === "external_link" ? "_blank" : undefined}
                rel={
                  item.type === "external_link"
                    ? "noopener noreferrer"
                    : undefined
                }
                className="block rounded-sm px-2 py-1.5 text-sm text-marketplace-muted-foreground hover:bg-marketplace-surface-subtle hover:text-marketplace-foreground"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
    </ul>
  );
}

export function MarketplaceCategoryRow({
  basePath,
  categories,
  menuItems = [],
  menuKey = "header",
  menuSettings = {},
  forYouCategoryIds = [],
}: MarketplaceCategoryRowProps) {
  const t = useTranslations("header");
  const pathname = usePathname();
  const { navigation } = useStoreThemeSettings();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressFocusOpenRef = useRef(false);
  const previousPathnameRef = useRef(pathname);
  const [openId, setOpenId] = useState<string | null>(null);
  const [previewMenuItems, setPreviewMenuItems] = useState<
    CmsNavigationItem[] | null
  >(null);
  const selectedMenuItems = previewMenuItems ?? menuItems;
  const categoryIndex = useMemo(() => {
    const index = new Map<string, Category>();
    for (const category of flattenCategories(categories)) {
      index.set(category.id, category);
      index.set(category.permalink, category);
    }
    return index;
  }, [categories]);
  const entries: MenuEntry[] = useMemo(() => {
    const configured = selectedMenuItems.filter(
      (item) => item.enabled !== false,
    );
    if (configured.length) {
      return configured.flatMap((item) => {
        const category = item.category_id
          ? categoryIndex.get(item.category_id)
          : undefined;
        const href = category
          ? `${basePath}/c/${category.permalink}`
          : safeCmsHref(item, basePath, categoryIndex);
        if (
          (item.type === "category" && !category) ||
          (!href &&
            !item.children?.length &&
            !category?.children?.length &&
            !item.featured_panels?.length)
        )
          return [];
        return [
          {
            id: item.id,
            label: item.label,
            href,
            category,
            children: item.children,
            featuredPanels: item.featured_panels,
            external: item.type === "external_link",
          },
        ];
      });
    }
    return categories.map((category) => ({
      id: category.id,
      label: category.name,
      href: `${basePath}/c/${category.permalink}`,
      category,
    }));
  }, [basePath, categories, categoryIndex, selectedMenuItems]);
  const activeEntry = entries.find((entry) => entry.id === openId) ?? null;
  const useMegaStyle = navigation?.style === "mega";

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const closeMenu = useCallback(() => {
    cancelClose();
    setOpenId(null);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpenId(null), 140);
  }, [cancelClose]);

  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeMenu();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openId, closeMenu]);

  useEffect(() => {
    const onNavigationPreview = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { key?: unknown; items?: unknown }
        | undefined;
      if (typeof detail?.key === "string" && Array.isArray(detail.items)) {
        setPreviewMenuItems(detail.items as CmsNavigationItem[]);
      }
    };
    window.addEventListener(
      "spree:cms-navigation-preview",
      onNavigationPreview,
    );
    return () =>
      window.removeEventListener(
        "spree:cms-navigation-preview",
        onNavigationPreview,
      );
  }, []);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      closeMenu();
    }
    return () => cancelClose();
  }, [pathname, closeMenu, cancelClose]);

  const entryHasPanel = (entry: MenuEntry) =>
    Boolean(
      entry.category?.children?.length ||
        entry.children?.length ||
        entry.featuredPanels?.some((panel) => panel.desktop_visible !== false),
    );

  const visibleForYouCategories = menuSettings.show_for_you
    ? forYouCategoryIds
        .map((id) => categoryIndex.get(id))
        .filter((category): category is Category => Boolean(category))
    : [];

  const panelHref = (panel: CmsNavigationFeaturedPanel) => {
    if (!panel.destination_type) return null;
    const item = {
      id: panel.id,
      type: panel.destination_type,
      label: panel.heading,
      target: panel.target,
      category_id: panel.category_id,
      collection_id: panel.collection_id,
    } as CmsNavigationItem;
    return safeCmsHref(item, basePath, categoryIndex);
  };

  const focusAdjacentTrigger = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const triggers = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>("[data-mega-trigger]") ??
        [],
    );
    const index = triggers.indexOf(event.target as HTMLElement);
    if (index < 0) return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    triggers[(index + delta + triggers.length) % triggers.length]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className="relative mx-auto hidden max-w-[1400px] px-4 md:block lg:px-6"
      style={{ backgroundColor: "inherit", color: "inherit" } as CSSProperties}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      onKeyDown={(event) => {
        if (event.key === "Escape" && openId) {
          event.preventDefault();
          const trigger = Array.from(
            rootRef.current?.querySelectorAll<HTMLElement>(
              "[data-mega-trigger]",
            ) ?? [],
          ).find((item) => item.dataset.megaTrigger === openId);
          closeMenu();
          suppressFocusOpenRef.current = true;
          trigger?.focus();
          queueMicrotask(() => {
            suppressFocusOpenRef.current = false;
          });
        } else {
          focusAdjacentTrigger(event);
        }
      }}
    >
      <nav
        aria-label={t("categoryNavigation")}
        data-theme-category-navigation
        data-category-menu-links
        data-theme-menu-key={menuKey}
        className="flex h-11 items-center justify-center gap-1 overflow-x-auto text-sm font-medium"
      >
        {entries.length ? (
          entries.map((entry) => {
            const hasPanel = entryHasPanel(entry);
            const isOpen = openId === entry.id;
            const active = Boolean(
              entry.href && pathname.startsWith(entry.href),
            );
            const content = (
              <>
                <span className="whitespace-nowrap">{entry.label}</span>
                {hasPanel ? (
                  <ChevronDown
                    className={`size-3.5 shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                ) : null}
              </>
            );
            return (
              <div key={entry.id} className="shrink-0">
                {hasPanel ? (
                  <button
                    type="button"
                    data-mega-trigger={entry.id}
                    aria-expanded={isOpen}
                    aria-controls={`mega-panel-${entry.id}`}
                    onClick={() => setOpenId(isOpen ? null : entry.id)}
                    onMouseEnter={() => setOpenId(entry.id)}
                    onFocus={() => {
                      if (!suppressFocusOpenRef.current) setOpenId(entry.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setOpenId(entry.id);
                        requestAnimationFrame(() => {
                          const panel = Array.from(
                            rootRef.current?.querySelectorAll<HTMLElement>(
                              "[id^='mega-panel-']",
                            ) ?? [],
                          ).find(
                            (item) => item.id === `mega-panel-${entry.id}`,
                          );
                          panel?.querySelector<HTMLElement>("a")?.focus();
                        });
                      }
                    }}
                    className={`inline-flex h-10 items-center gap-1 rounded-sm px-3 text-marketplace-foreground transition-colors hover:bg-marketplace-surface-subtle hover:text-marketplace-brand ${active || isOpen ? "bg-marketplace-surface-subtle text-marketplace-brand" : ""}`}
                  >
                    {content}
                  </button>
                ) : entry.href ? (
                  <Link
                    href={entry.href}
                    data-mega-trigger
                    onClick={closeMenu}
                    target={entry.external ? "_blank" : undefined}
                    rel={entry.external ? "noopener noreferrer" : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex h-10 items-center rounded-sm px-3 text-marketplace-foreground transition-colors hover:bg-marketplace-surface-subtle hover:text-marketplace-brand ${active ? "bg-marketplace-surface-subtle text-marketplace-brand" : ""}`}
                  >
                    {content}
                  </Link>
                ) : null}
              </div>
            );
          })
        ) : (
          <Link
            href={`${basePath}/products`}
            className="rounded-sm px-3 py-2 text-marketplace-foreground hover:text-marketplace-brand"
          >
            {t("allProducts")}
          </Link>
        )}
      </nav>

      {activeEntry ? (
        <div
          id={`mega-panel-${activeEntry.id}`}
          className={`absolute ${useMegaStyle ? "inset-x-0" : "left-1/2 w-[min(90vw,48rem)] -translate-x-1/2"} top-full z-[70] border-y border-marketplace-border shadow-lg ${openId ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"} transition duration-150 ease-out`}
          style={
            { backgroundColor: "inherit", color: "inherit" } as CSSProperties
          }
          onMouseEnter={cancelClose}
        >
          <div
            className={`mx-auto grid max-h-[min(70vh,36rem)] max-w-[1400px] grid-cols-1 gap-6 overflow-y-auto p-6 sm:grid-cols-2 lg:px-8 ${activeEntry.category?.image_url || activeEntry.category?.square_image_url || activeEntry.featuredPanels?.some((panel) => panel.desktop_visible !== false) ? "lg:grid-cols-[minmax(0,1fr)_15rem]" : "lg:grid-cols-1"}`}
          >
            <section className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-base font-semibold text-marketplace-foreground">
                  {activeEntry.label}
                </h2>
                {activeEntry.href ? (
                  <Link
                    href={activeEntry.href}
                    onClick={closeMenu}
                    className="shrink-0 text-sm font-medium text-marketplace-foreground underline-offset-4 hover:text-marketplace-brand hover:underline"
                  >
                    {t("viewAllCategory", { category: activeEntry.label })}
                  </Link>
                ) : null}
              </div>
              {activeEntry.category?.children?.length ? (
                <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                  {activeEntry.category.children.map((category) => (
                    <CategoryBranch
                      key={category.id}
                      category={category}
                      basePath={basePath}
                      onNavigate={closeMenu}
                    />
                  ))}
                </ul>
              ) : activeEntry.children?.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {activeEntry.children
                    .filter((item) => item.enabled !== false)
                    .map((item) => {
                      const href = safeCmsHref(item, basePath, categoryIndex);
                      const childCategory = item.category_id
                        ? categoryIndex.get(item.category_id)
                        : undefined;
                      return (
                        <section key={item.id}>
                          {childCategory ? (
                            <CategoryBranch
                              category={childCategory}
                              basePath={basePath}
                              onNavigate={closeMenu}
                            />
                          ) : href ? (
                            <Link
                              href={href}
                              onClick={closeMenu}
                              target={
                                item.type === "external_link"
                                  ? "_blank"
                                  : undefined
                              }
                              rel={
                                item.type === "external_link"
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="mb-2 block text-sm font-semibold text-marketplace-foreground hover:text-marketplace-brand"
                            >
                              {item.label}
                            </Link>
                          ) : null}
                          {item.children?.length ? (
                            <CmsItemList
                              items={item.children}
                              basePath={basePath}
                              categoryIndex={categoryIndex}
                              onNavigate={closeMenu}
                            />
                          ) : null}
                        </section>
                      );
                    })}
                </div>
              ) : null}
              {visibleForYouCategories.length ? (
                <section className="mt-6 border-t border-marketplace-border pt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase text-marketplace-muted-foreground">
                    {t("forYou")}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {visibleForYouCategories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`${basePath}/c/${category.permalink}`}
                          onClick={closeMenu}
                          className="inline-flex rounded-sm border border-marketplace-border px-2.5 py-1.5 text-sm text-marketplace-foreground hover:bg-marketplace-surface-subtle"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {menuSettings.search_shortcuts?.length ? (
                <section className="mt-4 border-t border-marketplace-border pt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase text-marketplace-muted-foreground">
                    {t("exploreSearches")}
                  </h3>
                  <ul className="flex flex-wrap gap-x-4 gap-y-2">
                    {menuSettings.search_shortcuts.map((shortcut) => (
                      <li key={shortcut.id}>
                        <Link
                          href={`${basePath}/products?q=${encodeURIComponent(shortcut.query)}`}
                          onClick={closeMenu}
                          className="text-sm text-marketplace-muted-foreground underline-offset-4 hover:text-marketplace-foreground hover:underline"
                        >
                          {shortcut.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </section>
            {activeEntry.featuredPanels?.some(
              (panel) =>
                panel.desktop_visible !== false && panel.placement !== "bottom",
            ) ? (
              <aside className="grid content-start gap-3 lg:w-60">
                {activeEntry.featuredPanels
                  .filter(
                    (panel) =>
                      panel.desktop_visible !== false &&
                      panel.placement !== "bottom",
                  )
                  .map((panel) => {
                    const href = panelHref(panel);
                    const content = (
                      <>
                        {panel.image_url ? (
                          <CategoryImage
                            src={panel.image_url}
                            alt=""
                            width={480}
                            height={320}
                            className="aspect-[3/2] w-full object-cover"
                            sizes="240px"
                          />
                        ) : null}
                        <span className="block p-3">
                          <span className="block text-sm font-semibold text-marketplace-foreground">
                            {panel.heading}
                          </span>
                          {panel.text ? (
                            <span className="mt-1 block text-xs leading-relaxed text-marketplace-muted-foreground">
                              {panel.text}
                            </span>
                          ) : null}
                          {panel.cta_label ? (
                            <span className="mt-3 inline-block text-sm font-medium text-marketplace-foreground underline underline-offset-4">
                              {panel.cta_label}
                            </span>
                          ) : null}
                        </span>
                      </>
                    );
                    return (
                      <div
                        key={panel.id}
                        className="overflow-hidden rounded-sm border border-marketplace-border bg-marketplace-surface-subtle"
                      >
                        {href ? (
                          <Link
                            href={href}
                            onClick={closeMenu}
                            target={
                              panel.destination_type === "external_link"
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              panel.destination_type === "external_link"
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="block"
                          >
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </div>
                    );
                  })}
              </aside>
            ) : null}
            {activeEntry.featuredPanels
              ?.filter(
                (panel) =>
                  panel.desktop_visible !== false &&
                  panel.placement === "bottom",
              )
              .map((panel) => {
                const href = panelHref(panel);
                const content = (
                  <span className="flex min-w-0 items-center gap-4">
                    {panel.image_url ? (
                      <CategoryImage
                        src={panel.image_url}
                        alt=""
                        width={120}
                        height={80}
                        className="aspect-[3/2] w-28 shrink-0 rounded-sm object-cover"
                        sizes="112px"
                      />
                    ) : null}
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {panel.heading}
                      </span>
                      {panel.text ? (
                        <span className="mt-1 block text-sm text-marketplace-muted-foreground">
                          {panel.text}
                        </span>
                      ) : null}
                      {panel.cta_label ? (
                        <span className="mt-2 inline-block text-sm underline underline-offset-4">
                          {panel.cta_label}
                        </span>
                      ) : null}
                    </span>
                  </span>
                );
                return (
                  <div
                    key={panel.id}
                    className="col-span-full border-t border-marketplace-border pt-4"
                  >
                    {href ? (
                      <Link
                        href={href}
                        onClick={closeMenu}
                        target={
                          panel.destination_type === "external_link"
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          panel.destination_type === "external_link"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="block"
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            {!activeEntry.featuredPanels?.some(
              (panel) => panel.desktop_visible !== false,
            ) &&
            (activeEntry.category?.image_url ||
              activeEntry.category?.square_image_url) ? (
              <Link
                href={activeEntry.href || `${basePath}/products`}
                onClick={closeMenu}
                className="group hidden overflow-hidden rounded-sm bg-marketplace-surface-subtle lg:block"
              >
                <CategoryImage
                  src={
                    activeEntry.category?.image_url ||
                    activeEntry.category?.square_image_url
                  }
                  alt=""
                  width={480}
                  height={320}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="240px"
                />
                <span className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-marketplace-foreground">
                  <span className="truncate">{activeEntry.label}</span>
                  <ChevronRight className="size-4 shrink-0" aria-hidden />
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
