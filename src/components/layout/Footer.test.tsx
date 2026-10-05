import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sellerOnboardingUrl: undefined as string | undefined,
  sellerPanelUrl: undefined as string | undefined,
}));

vi.mock("next-intl/server", () => ({
  getTranslations:
    async () => (key: string, values?: { marketplace?: string }) =>
      key === "sellOnMarketplace" ? `Sell on ${values?.marketplace}` : key,
}));
vi.mock("@/components/layout/RegionPreferences", () => ({
  RegionPreferences: () => <button type="button">Region</button>,
}));
vi.mock("@/lib/spree", () => ({ isWholesaleEnabled: () => false }));
vi.mock("@/lib/data/cms-navigation", () => ({
  getPublishedNavigation: vi.fn(async (key: string) =>
    key === "custom_footer"
      ? {
          key,
          items: [
            {
              id: "item_1",
              type: "internal_link",
              label: "Shipping",
              target: "/policies/shipping-policy",
            },
          ],
        }
      : null,
  ),
}));
vi.mock("@/lib/store", () => ({
  getStoreName: () => "Maker Market",
  getStoreDescription: () => "Independent goods from trusted sellers.",
  getSellerOnboardingUrl: () => mocks.sellerOnboardingUrl,
  getSellerPanelUrl: () => mocks.sellerPanelUrl,
}));

import { Footer } from "./Footer";
import { buildFooterContactMailtoHref } from "./FooterContactForm";

describe("Footer", () => {
  beforeEach(() => {
    mocks.sellerOnboardingUrl = undefined;
    mocks.sellerPanelUrl = undefined;
  });

  it("renders marketplace groups without demo links", async () => {
    render(
      await Footer({
        basePath: "/us/en",
        locale: "en",
        categoryLinks: <li>Jewelry</li>,
      }),
    );

    expect(screen.getByText("shop")).toBeInTheDocument();
    expect(screen.getByText("help")).toBeInTheDocument();
    expect(screen.getByText("marketplace")).toBeInTheDocument();
    expect(screen.queryByText(/github|quickstart|powered by/i)).toBeNull();
    expect(screen.queryByText("sell")).toBeNull();
  });

  it("shows seller links only when configured", async () => {
    mocks.sellerOnboardingUrl = "https://sell.example.com";
    mocks.sellerPanelUrl = "https://seller.example.com";

    render(
      await Footer({
        basePath: "/us/en",
        locale: "en",
        categoryLinks: null,
      }),
    );

    expect(screen.getByText("sell")).toBeInTheDocument();
    expect(screen.getByText("Sell on Maker Market")).toHaveAttribute(
      "href",
      "https://sell.example.com",
    );
    expect(screen.getByText("sellerSignIn")).toHaveAttribute(
      "href",
      "https://seller.example.com",
    );
  });

  it("builds an encoded contact email link while preserving the address separator", () => {
    expect(
      buildFooterContactMailtoHref(
        "help@example.com",
        "Order question",
        "Hello & thanks",
      ),
    ).toBe(
      "mailto:help@example.com?subject=Order%20question&body=Hello%20%26%20thanks",
    );
    expect(
      buildFooterContactMailtoHref("help@example.com\nBcc:x@y.com", "", ""),
    ).toBeNull();
    expect(buildFooterContactMailtoHref("help@localhost", "", "")).toBeNull();
  });

  it("renders footer menu blocks from their selected published menu", async () => {
    render(
      await Footer({
        basePath: "/us/en",
        locale: "en",
        categoryLinks: null,
        section: {
          section_id: "footer",
          section_type: "theme_footer",
          settings: { footer_blocks_initialized: true },
          block_order: ["menu"],
          blocks: {
            menu: {
              type: "footer_menu",
              settings: { title: "Help", menu_key: "custom_footer" },
            },
          },
        },
      }),
    );

    expect(screen.getByText("Shipping")).toHaveAttribute(
      "href",
      "/us/en/policies/shipping-policy",
    );
  });

  it("keeps payment marks off until enabled in footer settings", async () => {
    const { container } = render(
      await Footer({
        basePath: "/us/en",
        locale: "en",
        categoryLinks: null,
        section: {
          section_id: "footer",
          section_type: "theme_footer",
          settings: { footer_blocks_initialized: true },
          block_order: ["payments", "more-payments"],
          blocks: {
            payments: {
              type: "footer_payment_icons",
              settings: { title: "We accept", payment_methods: "Visa, PayPal" },
            },
            "more-payments": {
              type: "footer_payment_icons",
              settings: {
                title: "More ways to pay",
                payment_methods: "Klarna",
              },
            },
          },
        },
      }),
    );

    expect(
      container.querySelector("[data-theme-footer-payment-icons]"),
    ).toHaveStyle({
      display: "none",
    });
    expect(container.querySelector("[data-theme-footer-bottom]")).toHaveClass(
      "border-marketplace-border",
    );
  });

  it("renders configured payment marks when enabled in footer settings", async () => {
    const { container } = render(
      await Footer({
        basePath: "/us/en",
        locale: "en",
        categoryLinks: null,
        section: {
          section_id: "footer",
          section_type: "theme_footer",
          settings: {
            footer_blocks_initialized: true,
            footer_show_payment_icons: true,
          },
          block_order: ["payments"],
          blocks: {
            payments: {
              type: "footer_payment_icons",
              settings: { title: "We accept", payment_methods: "Visa, PayPal" },
            },
          },
        },
      }),
    );

    expect(
      container.querySelector("[data-theme-footer-payment-icons]"),
    ).toHaveStyle({
      display: "contents",
    });
    expect(
      container.querySelector("[aria-label='Visa'] svg"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[aria-label='PayPal'] svg"),
    ).toBeInTheDocument();
  });

  it("renders configured social accounts as accessible icon links", async () => {
    render(
      await Footer({
        basePath: "/us/en",
        locale: "en",
        categoryLinks: null,
        section: {
          section_id: "footer",
          section_type: "theme_footer",
          settings: { footer_blocks_initialized: true },
          block_order: ["social"],
          blocks: {
            social: {
              type: "footer_social_links",
              settings: {
                title: "Follow on social",
                instagram: "https://instagram.com/shop",
                facebook: "https://facebook.com/shop",
              },
            },
          },
        },
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Follow on social" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com/shop",
    );
    expect(screen.getByRole("link", { name: "Facebook" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("uses social blocks as the only social links in a custom footer", async () => {
    const { container } = render(
      await Footer({
        basePath: "/us/en",
        locale: "en",
        categoryLinks: null,
        section: {
          section_id: "footer",
          section_type: "theme_footer",
          settings: { footer_blocks_initialized: true },
          block_order: ["social"],
          blocks: {
            social: {
              type: "footer_social_links",
              settings: {
                title: "Follow on social",
                instagram: "https://instagram.com/shop",
              },
            },
          },
        },
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Follow on social" }),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-theme-global-social-accounts]"),
    ).toBeNull();
  });

  it("prefixes bare storefront paths on footer menu links with the locale base path", async () => {
    render(
      await Footer({
        basePath: "/us/en",
        locale: "en",
        categoryLinks: null,
        section: {
          section_id: "footer",
          section_type: "theme_footer",
          settings: { footer_blocks_initialized: true },
          block_order: ["menu"],
          blocks: {
            menu: {
              type: "footer_menu",
              settings: {
                title: "Shop",
                links: JSON.stringify([
                  { label: "All products", url: "/products" },
                  { label: "Shops", url: "/shops" },
                ]),
              },
            },
          },
        },
      }),
    );

    expect(screen.getByRole("link", { name: "All products" })).toHaveAttribute(
      "href",
      "/us/en/products",
    );
    expect(screen.getByRole("link", { name: "Shops" })).toHaveAttribute(
      "href",
      "/us/en/shops",
    );
  });

  it("renders every configured copyright block in the bottom row", async () => {
    render(
      await Footer({
        basePath: "/us/en",
        locale: "en",
        categoryLinks: null,
        section: {
          section_id: "footer",
          section_type: "theme_footer",
          settings: { footer_blocks_initialized: true },
          block_order: ["copyright", "extra"],
          blocks: {
            copyright: {
              type: "footer_copyright",
              settings: { text: "© {{year}} {{store}}. All rights reserved." },
            },
            extra: {
              type: "footer_copyright",
              settings: { text: "Made with care." },
            },
          },
        },
      }),
    );

    expect(screen.getByText(/Maker Market/)).toBeInTheDocument();
    expect(screen.getByText("Made with care.")).toBeInTheDocument();
  });
});
