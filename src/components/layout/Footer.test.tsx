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
vi.mock("@/lib/store", () => ({
  getStoreName: () => "Maker Market",
  getStoreDescription: () => "Independent goods from trusted sellers.",
  getSellerOnboardingUrl: () => mocks.sellerOnboardingUrl,
  getSellerPanelUrl: () => mocks.sellerPanelUrl,
}));

import { Footer } from "./Footer";

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
});
