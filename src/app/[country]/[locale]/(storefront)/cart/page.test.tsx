import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";

vi.mock("next/navigation", () => ({ usePathname: () => "/us/en/cart" }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    cart: { items: [], total_quantity: 0 },
    loading: false,
    updating: false,
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  }),
}));
vi.mock("@/lib/analytics/gtm", () => ({
  trackRemoveFromCart: vi.fn(),
  trackViewCart: vi.fn(),
}));
vi.mock("@/components/empty-states/EmptyStateIllustration", () => ({
  EmptyStateIllustration: () => <span aria-hidden="true" />,
}));

import CartPage from "./page";

describe("CartPage theme settings", () => {
  it("applies cart colors and visibility settings from the global theme", () => {
    render(
      <ThemeSettingsProvider
        settings={{
          cart: {
            background_color: "#f1e2d3",
            text_color: "#123456",
            border_color: "#654321",
            show_continue_shopping: "false",
          },
        }}
      >
        <CartPage />
      </ThemeSettingsProvider>,
    );

    const page = document.querySelector("[data-theme-cart-page]");
    expect(page).toHaveStyle({
      backgroundColor: "rgb(241, 226, 211)",
      color: "rgb(18, 52, 86)",
    });
    expect(screen.queryByText("continueShopping")).toBeNull();
  });

  it("updates cart page colors when preview settings change", () => {
    render(
      <ThemeSettingsProvider
        settings={{ cart: { background_color: "#ffffff" } }}
      >
        <CartPage />
      </ThemeSettingsProvider>,
    );

    act(() =>
      window.dispatchEvent(
        new CustomEvent("spree:theme-settings-preview", {
          detail: {
            cart: { background_color: "#abcdef", text_color: "#102030" },
          },
        }),
      ),
    );

    expect(document.querySelector("[data-theme-cart-page]")).toHaveStyle({
      backgroundColor: "rgb(171, 205, 239)",
      color: "rgb(16, 32, 48)",
    });
  });

  it("resolves palette cart colors to storefront theme variables", () => {
    render(
      <ThemeSettingsProvider
        settings={{
          cart: {
            background_color: "palette",
            text_color: "palette",
            border_color: "palette",
          },
        }}
      >
        <CartPage />
      </ThemeSettingsProvider>,
    );

    expect(document.querySelector("[data-theme-cart-page]")).toHaveStyle({
      backgroundColor: "var(--marketplace-surface)",
      color: "var(--marketplace-foreground)",
    });
  });
});
