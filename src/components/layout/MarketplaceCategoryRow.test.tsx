import type { Category } from "@spree/sdk";
import { render } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { MarketplaceCategoryRow } from "@/components/layout/MarketplaceCategoryRow";

vi.mock("next/navigation", () => ({ usePathname: () => "/us/en" }));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: { category?: string }) =>
    values?.category ? `${key} ${values.category}` : key,
}));
vi.mock("@/contexts/ThemeSettingsContext", () => ({
  useStoreThemeSettings: () => ({ navigation: { style: "mega" } }),
}));

function category(
  id: string,
  parent_id: string | null,
  permalink: string,
  name: string,
  children: Category[] = [],
): Category {
  return {
    id,
    parent_id,
    permalink,
    name,
    children,
    position: 0,
    depth: parent_id ? 1 : 0,
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    children_count: children.length,
    description: "",
    description_html: "",
    image_url: null,
    square_image_url: null,
    is_root: !parent_id,
    is_child: Boolean(parent_id),
    is_leaf: children.length === 0,
  };
}

describe("MarketplaceCategoryRow", () => {
  it("opens a nested category panel on pointer hover and closes on Escape", async () => {
    const leaf = category("leaf", "art", "art/prints", "Prints");
    const root = category("art", null, "art", "Art", [leaf]);
    const { container } = render(
      <MarketplaceCategoryRow basePath="/us/en" categories={[root]} />,
    );
    const trigger = container.querySelector<HTMLButtonElement>(
      '[data-mega-trigger="art"]',
    );
    expect(trigger).not.toBeNull();
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    });
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    expect(
      container.querySelector<HTMLAnchorElement>(
        'a[href="/us/en/c/art/prints"]',
      ),
    ).not.toBeNull();

    await act(async () => {
      trigger?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  });

  it("uses published CMS navigation order and keeps category links SEO-friendly", () => {
    const categoryNode = category("cat_1", null, "home/decor", "Decor", [
      category("cat_2", "cat_1", "home/decor/prints", "Prints"),
    ]);
    const { container } = render(
      <MarketplaceCategoryRow
        basePath="/us/en"
        categories={[categoryNode]}
        menuItems={[
          {
            id: "decor-menu",
            type: "category",
            label: "Home",
            category_id: "cat_1",
            enabled: true,
          },
        ]}
      />,
    );

    const trigger = container.querySelector<HTMLButtonElement>(
      '[data-mega-trigger="decor-menu"]',
    );
    act(() => {
      trigger?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    });
    expect(
      container.querySelector<HTMLAnchorElement>(
        'a[href="/us/en/c/home/decor/prints"]',
      ),
    ).not.toBeNull();
  });

  it("refreshes the menu when the Theme Builder previews another published menu", () => {
    const { container } = render(
      <MarketplaceCategoryRow
        basePath="/us/en"
        categories={[]}
        menuKey="header"
      />,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("spree:cms-navigation-preview", {
          detail: {
            key: "header",
            items: [
              {
                id: "seasonal",
                type: "internal_link",
                label: "Seasonal guide",
                target: "/pages/seasonal-guide",
              },
            ],
          },
        }),
      );
    });

    expect(
      container.querySelector<HTMLAnchorElement>(
        'a[href="/us/en/pages/seasonal-guide"]',
      ),
    ).not.toBeNull();
  });

  it("shows CMS featured panels, personalized categories, and localized curated searches", () => {
    const featuredCategory = category("cat-featured", null, "garden", "Garden");
    const personalCategory = category("cat-personal", null, "prints", "Prints");
    const { container } = render(
      <MarketplaceCategoryRow
        basePath="/us/fr"
        categories={[featuredCategory, personalCategory]}
        menuSettings={{
          show_for_you: true,
          search_shortcuts: [
            {
              id: "search-1",
              label: "Sunflower cards",
              query: "cartes tournesol",
            },
          ],
        }}
        forYouCategoryIds={["cat-personal"]}
        menuItems={[
          {
            id: "garden-menu",
            type: "category",
            label: "Garden",
            category_id: "cat-featured",
            featured_panels: [
              {
                id: "panel-1",
                heading: "Fresh from the garden",
                text: "Seasonal artwork",
                cta_label: "Browse",
                destination_type: "category",
                category_id: "cat-featured",
                image_url: "https://cdn.example.test/garden.jpg",
                desktop_visible: true,
                mobile_visible: true,
              },
            ],
          },
        ]}
      />,
    );
    const trigger = container.querySelector<HTMLButtonElement>(
      '[data-mega-trigger="garden-menu"]',
    );
    act(() =>
      trigger?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })),
    );

    expect(container.textContent).toContain("Fresh from the garden");
    expect(
      container.querySelector('img[src="https://cdn.example.test/garden.jpg"]'),
    ).not.toBeNull();
    expect(container.querySelector('a[href="/us/fr/c/garden"]')).not.toBeNull();
    expect(
      container.querySelector('a[href="/us/fr/c/prints"]')?.textContent,
    ).toBe("Prints");
    expect(
      container.querySelector('a[href="/us/fr/products?q=cartes%20tournesol"]')
        ?.textContent,
    ).toBe("Sunflower cards");
  });
});
