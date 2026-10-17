import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({
      closeMenu: "Close menu",
      openMenu: "Open menu",
      menu: "Menu",
      home: "Home",
      allProducts: "All Products",
      contact: "Contact",
      myAccount: "My Account",
      wholesale: "Wholesale",
      forYou: "For you",
      exploreSearches: "Explore searches",
    })[key] ?? key,
}));

vi.mock("@/components/layout/RegionPreferences", () => ({
  RegionPreferences: ({ variant }: { variant: string }) => (
    <button type="button" aria-label="Region and language">
      {variant}
    </button>
  ),
}));

describe("MobileMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("places My Account below Wholesale and centers Region and language", async () => {
    const user = userEvent.setup();

    render(
      <MobileMenu rootCategories={[]} basePath="/us/en" wholesaleEnabled />,
    );
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const menu = screen.getByRole("dialog", { name: "Menu" });
    const wholesale = within(menu).getByRole("link", { name: "Wholesale" });
    const myAccount = within(menu).getByRole("link", { name: "My Account" });
    const regionPreferences = within(menu).getByRole("button", {
      name: "Region and language",
    });
    const footer = regionPreferences.closest('[data-slot="sheet-footer"]');

    expect(
      wholesale.compareDocumentPosition(myAccount) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(footer).toHaveClass("items-center");
  });

  it("keeps the wholesale entry hidden when the addon is disabled", async () => {
    const user = userEvent.setup();

    render(
      <MobileMenu
        rootCategories={[]}
        basePath="/us/en"
        wholesaleEnabled={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const menu = screen.getByRole("dialog", { name: "Menu" });
    expect(
      within(menu).queryByRole("link", { name: "Wholesale" }),
    ).not.toBeInTheDocument();
    expect(
      within(menu).getByRole("link", { name: "My Account" }),
    ).toHaveAttribute("href", "/us/en/account");
  });

  it("applies the menu block mobile layout settings", async () => {
    const user = userEvent.setup();
    render(
      <MobileMenu
        rootCategories={[
          {
            id: "category-1",
            name: "Home",
            permalink: "home",
            position: 0,
            depth: 0,
            meta_title: null,
            meta_description: null,
            meta_keywords: null,
            children_count: 0,
            parent_id: null,
            description: "",
            description_html: "",
            image_url: null,
            square_image_url: null,
            is_root: true,
            is_child: false,
            is_leaf: true,
          },
        ]}
        basePath="/us/en"
        wholesaleEnabled={false}
        accordionNavigation
        showNavigationBar
        showDividers
        menuBackgroundColor="#ffffff"
        menuTextColor="#222222"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const menu = screen.getByRole("dialog", { name: "Menu" });
    const navigationBar = within(menu).getByRole("navigation", {
      name: "categoryNavigation",
    });
    expect(navigationBar).toHaveAttribute("data-theme-mobile-navigation-bar");
    expect(
      within(navigationBar).getByRole("link", { name: "Home" }),
    ).toHaveClass("rounded-full");
    expect(menu).toHaveStyle({ backgroundColor: "#ffffff", color: "#222222" });
  });

  it("uses the global mobile navigation style when the menu has no override", async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsProvider
        settings={{ navigation: { mobile_style: "accordion" } }}
      >
        <MobileMenu
          rootCategories={[
            {
              id: "category-1",
              name: "Home",
              permalink: "home",
              position: 0,
              depth: 0,
              meta_title: null,
              meta_description: null,
              meta_keywords: null,
              children_count: 1,
              parent_id: null,
              description: "",
              description_html: "",
              image_url: null,
              square_image_url: null,
              is_root: true,
              is_child: false,
              is_leaf: false,
              children: [
                {
                  id: "child-1",
                  name: "Decor",
                  permalink: "decor",
                  position: 0,
                  depth: 1,
                  meta_title: null,
                  meta_description: null,
                  meta_keywords: null,
                  children_count: 0,
                  parent_id: "category-1",
                  description: "",
                  description_html: "",
                  image_url: null,
                  square_image_url: null,
                  is_root: false,
                  is_child: true,
                  is_leaf: true,
                },
              ],
            },
          ]}
          basePath="/us/en"
          wholesaleEnabled={false}
          accordionNavigation={false}
        />
      </ThemeSettingsProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const menu = screen.getByRole("dialog", { name: "Menu" });
    expect(
      within(menu)
        .getByText("Home", { selector: "summary" })
        .closest("details"),
    ).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: "Decor" })).toHaveAttribute(
      "href",
      "/us/en/c/decor",
    );
  });

  it("shows mobile-enabled editorial panels and locale-aware shortcuts", async () => {
    const user = userEvent.setup();
    render(
      <MobileMenu
        rootCategories={[
          {
            id: "cat-prints",
            name: "Prints",
            permalink: "prints",
            position: 0,
            depth: 0,
            meta_title: null,
            meta_description: null,
            meta_keywords: null,
            children_count: 0,
            parent_id: null,
            description: "",
            description_html: "",
            image_url: null,
            square_image_url: null,
            is_root: true,
            is_child: false,
            is_leaf: true,
          },
        ]}
        basePath="/us/fr"
        wholesaleEnabled={false}
        cmsItems={[
          {
            id: "root",
            type: "internal_link",
            label: "Stories",
            target: "/pages/stories",
            featured_panels: [
              {
                id: "maker-story",
                heading: "Meet the makers",
                text: "Their latest work",
                cta_label: "Read the story",
                destination_type: "internal_link",
                target: "/pages/makers",
                mobile_visible: true,
              },
            ],
          },
        ]}
        cmsSettings={{
          show_for_you: true,
          search_shortcuts: [
            { id: "cards", label: "Greeting cards", query: "cartes" },
          ],
        }}
        forYouCategoryIds={["cat-prints"]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const menu = screen.getByRole("dialog", { name: "Menu" });
    expect(
      within(menu).getByRole("link", { name: /Meet the makers/ }),
    ).toHaveAttribute("href", "/us/fr/pages/makers");
    const forYouSection = within(menu).getByText("For you")
      .parentElement as HTMLElement;
    expect(
      within(forYouSection).getByRole("link", { name: "Prints" }),
    ).toHaveAttribute("href", "/us/fr/c/prints");
    expect(
      within(menu).getByRole("link", { name: "Greeting cards" }),
    ).toHaveAttribute("href", "/us/fr/products?q=cartes");
  });
});
