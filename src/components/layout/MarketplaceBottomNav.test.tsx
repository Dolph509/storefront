import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";

vi.mock("next/navigation", () => ({
  usePathname: () => "/storefront-embed/us/en/account/favorites",
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/components/layout/MobileMenu", () => ({
  MobileMenu: () => <button type="button">browse</button>,
}));
vi.mock("@/components/account/MessagesNavBadge", () => ({
  MessagesNavBadge: () => null,
}));

const authState = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
    loading: false,
  }),
}));

import { MarketplaceBottomNav } from "./MarketplaceBottomNav";

describe("MarketplaceBottomNav", () => {
  it("renders exactly five canonical destinations and marks the current one", () => {
    authState.isAuthenticated = true;
    render(
      <MarketplaceBottomNav
        rootCategories={[]}
        basePath="/us/en"
        wholesaleEnabled={false}
      />,
    );

    const navigation = screen.getByRole("navigation", {
      name: "marketplaceNavigation",
    });
    expect(navigation.firstElementChild?.children).toHaveLength(5);
    expect(within(navigation).getByText("home").closest("a")).toHaveAttribute(
      "href",
      "/us/en",
    );
    expect(
      within(navigation).getByText("favorites").closest("a"),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByText("messages").closest("a"),
    ).toHaveAttribute("href", "/us/en/account/messages");
    expect(
      within(navigation).getByText("account").closest("a"),
    ).toHaveAttribute("href", "/us/en/account");
  });

  it("removes the favorites destination when the General wishlist setting is off", () => {
    authState.isAuthenticated = true;
    render(
      <ThemeSettingsProvider settings={{ general: { enable_wishlist: false } }}>
        <MarketplaceBottomNav
          rootCategories={[]}
          basePath="/us/en"
          wholesaleEnabled={false}
        />
      </ThemeSettingsProvider>,
    );

    const navigation = screen.getByRole("navigation", {
      name: "marketplaceNavigation",
    });
    expect(within(navigation).queryByText("favorites")).not.toBeInTheDocument();
    expect(navigation.firstElementChild?.children).toHaveLength(4);
  });

  it("hides favorites and messages when the shopper is signed out", () => {
    authState.isAuthenticated = false;
    render(
      <MarketplaceBottomNav
        rootCategories={[]}
        basePath="/us/en"
        wholesaleEnabled={false}
      />,
    );

    const navigation = screen.getByRole("navigation", {
      name: "marketplaceNavigation",
    });
    expect(within(navigation).queryByText("favorites")).not.toBeInTheDocument();
    expect(within(navigation).queryByText("messages")).not.toBeInTheDocument();
    expect(navigation.firstElementChild?.children).toHaveLength(3);
  });
});
