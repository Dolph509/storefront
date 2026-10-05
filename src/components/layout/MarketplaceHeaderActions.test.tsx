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
    },
    logout: vi.fn(),
  },
  getBuyerOffers: vi.fn().mockResolvedValue({ data: [] }),
  getProductsByIds: vi.fn().mockResolvedValue([]),
  getCustomer: vi.fn().mockResolvedValue({
    display_available_store_credit_total: "$12.00",
  }),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "en-US",
  useTranslations: () => (key: string) => key,
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

vi.mock("@/lib/data/offers", () => ({
  getBuyerOffers: mocks.getBuyerOffers,
}));

vi.mock("@/lib/data/products", () => ({
  getProductsByIds: mocks.getProductsByIds,
}));

vi.mock("@/lib/data/customer", () => ({
  getCustomer: mocks.getCustomer,
}));

vi.mock("@/components/layout/CartButton", () => ({
  CartButton: () => (
    <button type="button" aria-label="openCart">
      <span className="marketplace-header-hover-label">cart</span>
    </button>
  ),
}));

import { MarketplaceHeaderActions } from "./MarketplaceHeaderActions";

function renderActions() {
  return render(
    <MarketplaceHeaderActions
      basePath="/us/en"
      sellLabel="Sell"
      variant="etsy"
    />,
  );
}

describe("MarketplaceHeaderActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getBuyerOffers.mockResolvedValue({ data: [] });
    mocks.getProductsByIds.mockResolvedValue([]);
    mocks.getCustomer.mockResolvedValue({
      display_available_store_credit_total: "$12.00",
    });
    mocks.auth.isAuthenticated = true;
    mocks.auth.user = {
      id: "buyer-1",
      email: "dev-buyer@example.com",
      first_name: "Dev",
    };
  });

  it("shows the logged-in buyer icon row and useful menus", async () => {
    const user = userEvent.setup();
    renderActions();

    const favoritesLink = screen.getByRole("link", { name: "favorites" });
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
    expect(screen.getByText("D")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "deals" }));
    expect(await screen.findByText("emptyTitle")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "viewAllDeals" })).toHaveAttribute(
      "href",
      "/us/en/account/offers",
    );

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "myAccount" }));
    expect(await screen.findByText("purchasesAndReviews")).toBeInTheDocument();
    expect(screen.getByText("specialOffers")).toBeInTheDocument();
    expect(screen.getByText("$12.00")).toBeInTheDocument();
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
      screen.getByRole("button", { name: "openCart" }),
    ).toBeInTheDocument();
  });

  it("shows the seller and product details for recent buyer offers", async () => {
    const user = userEvent.setup();
    mocks.getBuyerOffers.mockResolvedValue({
      data: [
        {
          id: "offer-1",
          status: "awaiting_buyer",
          offer_amount: 12,
          list_amount: 20,
          final_amount: null,
          currency: "USD",
          buyer_message: null,
          created_at: "2026-09-28T10:00:00Z",
          updated_at: "2026-09-29T10:00:00Z",
          expires_at: null,
          buyer_accept_by: null,
          discount_percent: 40,
          product_id: "product-1",
          variant_id: "variant-1",
          promotion_code: null,
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

    expect(await screen.findByText("Ceramic Planter")).toBeInTheDocument();
    expect(screen.getByText("$12.00")).toBeInTheDocument();
    expect(screen.getByAltText("Ceramic Planter")).toBeInTheDocument();
    expect(mocks.getProductsByIds).toHaveBeenCalledWith(["product-1"]);
  });
});
