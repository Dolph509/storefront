import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";

const cartState = vi.hoisted(() => ({
  cart: null as Record<string, unknown> | null,
  loading: true,
  itemCount: 0,
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/us/en" }));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    cart: cartState.cart,
    loading: cartState.loading,
    updating: false,
    isOpen: true,
    closeCart: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    itemCount: cartState.itemCount,
    refreshCart: vi.fn(),
  }),
}));
vi.mock("@/components/cart/CartLineItems", () => ({
  CartLineItems: () => <div data-testid="cart-line-items" />,
}));
vi.mock("@/lib/analytics/gtm", () => ({
  trackRemoveFromCart: vi.fn(),
  trackViewCart: vi.fn(),
}));

describe("CartDrawer", () => {
  beforeEach(() => {
    cartState.cart = null;
    cartState.loading = true;
    cartState.itemCount = 0;
  });

  it("applies the saved drawer side and width", () => {
    render(
      <CartDrawer
        settings={{
          cart: { drawer_position: "left", drawer_width: "wide" },
        }}
      />,
    );

    const drawer = screen.getByRole("dialog", { name: "cart" });
    expect(drawer).toHaveAttribute("data-side", "left");
    expect(drawer.className).toContain("data-[side=left]:sm:max-w-xl");
  });

  it("applies saved cart colors to the drawer border variable", () => {
    render(
      <CartDrawer
        settings={{
          cart: {
            background_color: "#ffffff",
            text_color: "#222222",
            border_color: "#c1c1c1",
          },
        }}
      />,
    );

    const drawer = screen.getByRole("dialog", { name: "cart" });
    expect(drawer).toHaveStyle({
      backgroundColor: "rgb(255, 255, 255)",
      color: "rgb(34, 34, 34)",
      borderColor: "rgb(193, 193, 193)",
      "--theme-cart-border": "#c1c1c1",
    });
    expect(
      drawer.querySelector("[data-slot='sheet-header']")?.getAttribute("style"),
    ).toContain("var(--theme-cart-border, #e5e7eb)");
  });

  it("resolves palette cart colors to the storefront theme palette", () => {
    render(
      <CartDrawer
        settings={{
          cart: {
            background_color: "palette",
            text_color: "palette",
            border_color: "palette",
          },
        }}
      />,
    );

    const style = screen
      .getByRole("dialog", { name: "cart" })
      .getAttribute("style");
    expect(style).toContain("var(--marketplace-surface)");
    expect(style).toContain("var(--marketplace-foreground)");
    expect(style).toContain("var(--marketplace-border)");
  });

  it("updates cart colors when the theme builder sends live preview settings", () => {
    render(
      <ThemeSettingsProvider
        settings={{ cart: { background_color: "#ffffff" } }}
      >
        <CartDrawer
          settings={{
            cart: {
              background_color: "#ffffff",
              text_color: "#222222",
              border_color: "#c1c1c1",
            },
          }}
        />
      </ThemeSettingsProvider>,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("spree:theme-settings-preview", {
          detail: {
            cart: {
              background_color: "#abcdef",
              text_color: "#123456",
              border_color: "#654321",
            },
          },
        }),
      );
    });

    const drawer = screen.getByRole("dialog", { name: "cart" });
    expect(drawer).toHaveStyle({
      backgroundColor: "rgb(171, 205, 239)",
      color: "rgb(18, 52, 86)",
      borderColor: "rgb(101, 67, 33)",
      "--theme-cart-border": "#654321",
    });
  });

  it("hides checkout when disabled while keeping the view-cart action", () => {
    cartState.cart = {
      id: "cart-1",
      items: [{ id: "line-1" }],
      total: "10",
      total_quantity: 1,
    };
    cartState.loading = false;
    cartState.itemCount = 1;

    render(
      <CartDrawer
        settings={{
          cart: {
            show_checkout_button: "false",
            show_continue_shopping: "false",
          },
          checkout: {
            show_express_checkout: "false",
            show_order_summary: "false",
          },
        }}
      />,
    );

    expect(screen.getByTestId("cart-line-items")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "checkout" })).toBeNull();
    expect(screen.getByRole("link", { name: "viewCart" })).toBeInTheDocument();
    expect(screen.queryByText("subtotal")).toBeNull();
  });
});
