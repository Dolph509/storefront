import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { getTrendingProducts, getNewArrivalProducts } = vi.hoisted(() => ({
  getTrendingProducts: vi.fn(),
  getNewArrivalProducts: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/data/recommendations", () => ({
  getTrendingProducts,
  getNewArrivalProducts,
}));
vi.mock("@/components/ui/product-image", () => ({
  ProductImage: () => <span />,
}));
vi.mock("@/components/products/FeaturedCollectionQuickAdd", () => ({
  FeaturedCollectionQuickAdd: ({ buttonLabel }: { buttonLabel: string }) => (
    <button type="button">{buttonLabel}</button>
  ),
}));

import { CartAddOns } from "./CartAddOns";

describe("CartAddOns", () => {
  it("shows trending items while excluding products already in the cart", async () => {
    getNewArrivalProducts.mockResolvedValue([]);
    getTrendingProducts.mockResolvedValue([
      {
        id: "product-1",
        slug: "already-in-cart",
        name: "Already in cart",
        purchasable: true,
        default_variant_id: "variant-1",
        thumbnail_url: "/already.jpg",
        price: { display_amount: "$20" },
      },
      {
        id: "product-2",
        slug: "new-find",
        name: "A new find",
        purchasable: true,
        default_variant_id: "variant-2",
        thumbnail_url: "/new.jpg",
        price: { display_amount: "$18" },
      },
      {
        id: "product-3",
        slug: "another-find",
        name: "Another new find",
        purchasable: true,
        default_variant_id: "variant-3",
        thumbnail_url: "/another.jpg",
        price: { display_amount: "$22" },
      },
    ]);

    render(<CartAddOns basePath="/us/en" cartSlugs={["already-in-cart"]} />);

    expect(await screen.findByText("A new find")).toBeInTheDocument();
    expect(screen.queryByText("Already in cart")).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "addToCartPlus" }),
    ).toHaveLength(2);
    await waitFor(() => expect(getTrendingProducts).toHaveBeenCalledOnce());
  });

  it("hides the add-on section when listings have no usable product data", async () => {
    getNewArrivalProducts.mockResolvedValue([]);
    getTrendingProducts.mockResolvedValue([
      {
        id: "product-1",
        slug: "one-find",
        name: "One find",
        thumbnail_url: null,
        price: null,
      },
    ]);

    const { container } = render(
      <CartAddOns basePath="/us/en" cartSlugs={[]} />,
    );

    await waitFor(() => expect(getTrendingProducts).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("fills from new arrivals when trending listings are placeholders", async () => {
    getTrendingProducts.mockResolvedValue([
      {
        id: "placeholder",
        slug: "placeholder",
        name: "Placeholder listing",
        thumbnail_url: null,
        price: null,
      },
    ]);
    getNewArrivalProducts.mockResolvedValue([
      {
        id: "arrival",
        slug: "fresh-find",
        name: "Fresh find",
        thumbnail_url: "/fresh.jpg",
        default_variant_id: "variant-fresh",
        price: { display_amount: "$25" },
      },
    ]);

    render(<CartAddOns basePath="/us/en" cartSlugs={[]} />);

    expect(await screen.findByText("Fresh find")).toBeInTheDocument();
    expect(screen.queryByText("Placeholder listing")).not.toBeInTheDocument();
  });
});
