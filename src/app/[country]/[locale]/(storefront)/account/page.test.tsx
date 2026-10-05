import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getOrders: vi.fn(),
  getUnreadMessageCount: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

vi.mock("@/components/account/AccountShell", () => ({
  AccountShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="account-shell">{children}</div>
  ),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(),
    isAuthenticated: true,
    loading: false,
    user: { id: "buyer-1", email: "buyer@example.com", first_name: "Buyer" },
  }),
}));

vi.mock("@/lib/data/orders", () => ({ getOrders: mocks.getOrders }));
vi.mock("@/lib/data/messages", () => ({
  getUnreadMessageCount: mocks.getUnreadMessageCount,
}));

import AccountPage from "./page";

describe("AccountPage buyer overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUnreadMessageCount.mockResolvedValue(0);
  });

  it("shows recent completed orders and skips incomplete carts", async () => {
    mocks.getOrders.mockResolvedValue({
      data: [
        {
          id: "order-1",
          number: "R1001",
          completed_at: "2026-09-30T12:00:00Z",
          seller_name: "Studio North",
          display_total: "$48.00",
        },
        {
          id: "cart-1",
          number: "CART-1",
          completed_at: null,
          seller_name: null,
          display_total: "$12.00",
        },
      ],
    });

    render(<AccountPage />);

    expect(
      screen.getByRole("heading", { name: "account.accountOverview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /account\.giftCards/ }),
    ).toHaveAttribute("href", "/us/en/account/gift-cards");

    const orderLink = await screen.findByRole("link", { name: /#R1001/ });
    expect(orderLink).toHaveAttribute("href", "/us/en/account/orders/order-1");
    expect(
      within(orderLink).getByText("Studio North", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/CART-1/)).not.toBeInTheDocument();
    expect(mocks.getOrders).toHaveBeenCalledWith({ limit: 4 });
  });

  it("offers a path to shopping when the buyer has no completed orders", async () => {
    mocks.getOrders.mockResolvedValue({ data: [] });

    render(<AccountPage />);

    expect(await screen.findByText("orders.noOrders")).toBeInTheDocument();
    const shoppingLinks = screen.getAllByRole("link", {
      name: "orders.startShopping",
    });
    expect(shoppingLinks.length).toBeGreaterThan(0);
    for (const link of shoppingLinks) {
      expect(link).toHaveAttribute("href", "/us/en/products");
    }
  });

  it("surfaces an unread messages action when the buyer has unread threads", async () => {
    mocks.getOrders.mockResolvedValue({ data: [] });
    mocks.getUnreadMessageCount.mockResolvedValue(2);

    render(<AccountPage />);

    const messagesLink = await screen.findByRole("link", {
      name: "account.unreadMessagesAction",
    });
    expect(messagesLink).toHaveAttribute("href", "/us/en/account/messages");
  });
});
