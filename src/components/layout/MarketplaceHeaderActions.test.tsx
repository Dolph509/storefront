import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: {
    isAuthenticated: true as boolean,
    user: {
      id: "buyer-1",
      email: "dev-buyer@example.com",
      first_name: "Dev",
      seller_dashboard_access: false as boolean,
    },
    logout: vi.fn(),
  },
  getShopOffers: vi.fn().mockResolvedValue({ data: [] }),
  markShopOffersSeen: vi.fn().mockResolvedValue({ updated: 0 }),
  getUnreadShopOfferCount: vi.fn().mockResolvedValue(0),
  getProductsByIds: vi.fn().mockResolvedValue([]),
  getCustomer: vi.fn().mockResolvedValue({
    display_available_store_credit_total: "$12.00",
  }),
  listSellerApplications: vi.fn().mockResolvedValue([]),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "en-US",
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (!values) return key;
    return `${key}:${JSON.stringify(values)}`;
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mocks.auth,
}));

vi.mock("@/contexts/ThemeSettingsContext", () => ({
  useStoreThemeSettings: () => ({ general: { enable_wishlist: true } }),
}));

vi.mock("@/components/account/MessagesNavBadge", () => ({
  MessagesNavBadge: () => <span data-testid="unread-badge">1</span>,
}));

vi.mock("@/lib/data/shop-offers", () => ({
  getShopOffers: mocks.getShopOffers,
  markShopOffersSeen: mocks.markShopOffersSeen,
  getUnreadShopOfferCount: mocks.getUnreadShopOfferCount,
}));

vi.mock("@/lib/data/products", () => ({
  getProductsByIds: mocks.getProductsByIds,
}));

vi.mock("@/lib/data/customer", () => ({
  getCustomer: mocks.getCustomer,
}));

vi.mock("@/lib/data/seller-applications", () => ({
  listSellerApplications: mocks.listSellerApplications,
}));

vi.mock("@/components/layout/CartButton", () => ({
  CartButton: () => (
    <button type="button" aria-label="openCart">
      <span className="marketplace-header-hover-label">cart</span>
    </button>
  ),
}));

import { MarketplaceHeaderActions } from "./MarketplaceHeaderActions";

function renderActions(sellerPanelHref?: string) {
  return render(
    <MarketplaceHeaderActions
      basePath="/us/en"
      sellerPanelHref={sellerPanelHref}
      variant="etsy"
    />,
  );
}

describe("MarketplaceHeaderActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getShopOffers.mockResolvedValue({ data: [] });
    mocks.markShopOffersSeen.mockResolvedValue({ updated: 0 });
    mocks.getUnreadShopOfferCount.mockResolvedValue(0);
    mocks.getProductsByIds.mockResolvedValue([]);
    mocks.getCustomer.mockResolvedValue({
      display_available_store_credit_total: "$12.00",
    });
    mocks.listSellerApplications.mockResolvedValue([]);
    mocks.auth.isAuthenticated = true;
    mocks.auth.user = {
      id: "buyer-1",
      email: "dev-buyer@example.com",
      first_name: "Dev",
      seller_dashboard_access: false,
    };
  });

  it("shows the logged-in buyer icon row and useful menus", async () => {
    const user = userEvent.setup();
    renderActions();

    const favoritesLink = screen.getByRole("link", { name: "favorites" });
    expect(favoritesLink).toHaveClass("max-md:hidden");
    expect(favoritesLink).toHaveAttribute("href", "/us/en/account/favorites");
    expect(
      favoritesLink.querySelector(".marketplace-header-hover-label"),
    ).toHaveTextContent("favorites");
    expect(favoritesLink.querySelector(".bg-marketplace-sale")).toHaveClass(
      "rounded-full",
    );
    expect(
      screen.queryByRole("link", { name: "followedShops" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "openCart" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole("button", { name: "deals" })
        .querySelector(".marketplace-header-hover-label"),
    ).toHaveTextContent("deals");
    expect(
      screen
        .getByRole("button", { name: "openCart" })
        .querySelector(".marketplace-header-hover-label"),
    ).toHaveTextContent("cart");
    expect(
      screen
        .getByRole("button", { name: "myAccount" })
        .querySelector(".marketplace-header-hover-label"),
    ).toHaveTextContent("myAccount");
    const mobileAccountLink = screen.getByRole("link", { name: "myAccount" });
    expect(mobileAccountLink).toHaveAttribute("href", "/us/en/account");
    expect(mobileAccountLink).toHaveClass("md:hidden");
    expect(mobileAccountLink).toHaveTextContent("D");

    await user.click(screen.getByRole("button", { name: "deals" }));
    expect(await screen.findByText("shopOffersEmptyTitle")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "myAccount" }));
    const accountIdentityItem = screen.getByRole("menuitem", {
      name: /Devdev-buyer@example.com/i,
    });
    expect(accountIdentityItem).toHaveAttribute("href", "/us/en/account");
    expect(await screen.findByText("purchasesAndReviews")).toBeInTheDocument();
    expect(screen.getByText("specialOffers")).toBeInTheDocument();
    expect(screen.getByText("$12.00")).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: /sellerJourney\./ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByText("signOut"));
    expect(mocks.auth.logout).toHaveBeenCalledOnce();
  });

  it("does not show buyer-only shortcuts when signed out", () => {
    mocks.auth.isAuthenticated = false;

    renderActions();

    expect(
      screen.queryByRole("button", { name: "deals" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "followedShops" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "sellerDashboard" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "openCart" }),
    ).toBeInTheDocument();
  });

  it("never shows a seller dashboard shortcut in the header", () => {
    mocks.auth.user = {
      ...mocks.auth.user,
      seller_dashboard_access: true,
    };

    renderActions("https://seller.example.com");

    expect(
      screen.queryByRole("link", { name: "sellerDashboard" }),
    ).not.toBeInTheDocument();
  });

  it("shows seller campaign offers in the deals menu", async () => {
    const user = userEvent.setup();
    mocks.getShopOffers.mockResolvedValue({
      data: [
        {
          id: "shopoff-1",
          source: "thank_you",
          created_at: "2026-09-28T10:00:00Z",
          seller_id: "seller-1",
          seller_name: "Studio North",
          product_id: "product-1",
          promotion_code: "SAVE10",
          discount_percent: 10,
          discount_amount: null,
          discount_kind: "percent",
          expires_at: "2026-12-28T10:00:00Z",
          redeemed_at: null,
          seen_at: null,
          expired: false,
          available: true,
          seen: false,
        },
      ],
    });
    mocks.getProductsByIds.mockResolvedValue([
      {
        id: "product-1",
        name: "Ceramic Planter",
        seller_name: "Studio North",
        thumbnail_url: "https://example.test/planter.jpg",
      },
    ]);

    renderActions();
    await user.click(screen.getByRole("button", { name: "deals" }));

    expect(
      await screen.findByText('thankYouOffer:{"seller":"Studio North"}'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'shopOfferPercentOffWithCode:{"percent":10,"code":"SAVE10"}',
      ),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Ceramic Planter")).toBeInTheDocument();
    expect(mocks.getProductsByIds).toHaveBeenCalledWith(["product-1"]);
    expect(mocks.markShopOffersSeen).toHaveBeenCalledWith(["shopoff-1"]);
  });
});
