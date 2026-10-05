import type { Product } from "@spree/sdk";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PRODUCT_PAGE_EXPAND } from "@/lib/data/cached";
import { ProductDetails } from "./ProductDetails";

const { addItem, routerPush } = vi.hoisted(() => ({
  addItem: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "en-US",
  useTranslations: () => {
    const t = (key: string) => key;
    t.rich = (key: string) => key;
    return t;
  },
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/us/en/products/test-product",
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/components/products/MediaGallery", () => ({
  MediaGallery: () => null,
}));

vi.mock("@/components/products/FavoriteButton", () => ({
  FavoriteButton: () => null,
}));

vi.mock("@/components/layout/RegionPreferences", () => ({
  RegionPreferences: () => null,
}));

vi.mock("@/components/products/ProductCustomFields", () => ({
  ProductCustomFields: () => null,
}));

vi.mock("@/components/cart/QuantityPickerField", () => ({
  QuantityPickerField: () => <div data-testid="quantity-picker" />,
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addItem, updating: false }),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@/contexts/HiddenPricingContext", () => ({
  useHiddenPricing: () => null,
}));

vi.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({ currency: "USD" }),
}));

vi.mock("@/lib/analytics/gtm", () => ({
  trackAddToCart: vi.fn(),
  trackViewItem: vi.fn(),
}));

const productWithoutCustomVariants = {
  id: "product-1",
  name: "Single Variant Product",
  slug: "single-variant-product",
  default_variant_id: "variant-master",
  default_variant: {
    id: "variant-master",
    product_id: "product-1",
    sku: "MASTER-SKU-001",
    options_text: "",
    purchasable: true,
    in_stock: true,
    price: {
      display_amount: "$25.00",
      amount_in_cents: 2500,
      compare_at_amount_in_cents: null,
      display_compare_at_amount: null,
    },
    original_price: null,
  },
  variants: [],
  option_types: [],
  media: [],
  purchasable: true,
  in_stock: true,
  price: {
    display_amount: "$25.00",
    amount_in_cents: 2500,
    compare_at_amount_in_cents: null,
    display_compare_at_amount: null,
  },
  original_price: null,
  description_html: null,
  custom_fields: [],
  reviews_count: 0,
  average_rating: null,
} as unknown as Product;

const productWithPersonalization = {
  ...productWithoutCustomVariants,
  personalization_fields: [
    {
      id: "engraving",
      name: "Name to engrave",
      field_type: "short_text",
      required: true,
      position: 1,
      conditions: [],
    },
  ],
} as unknown as Product;

const productWithOptionalFile = {
  ...productWithoutCustomVariants,
  personalization_fields: [
    {
      id: "photo",
      name: "Photo(s)",
      field_type: "file",
      required: false,
      position: 1,
      instructions: null,
      configuration: {},
      choices: [],
    },
  ],
} as unknown as Product;

describe("ProductDetails", () => {
  it("requests the default variant for the product page", () => {
    expect(PRODUCT_PAGE_EXPAND).toContain("default_variant");
  });

  it("shows the master SKU when a product has no custom variants", () => {
    render(
      <ProductDetails
        product={productWithoutCustomVariants}
        basePath="/us/en"
      />,
    );

    expect(screen.getByText("sku")).toBeInTheDocument();
    expect(screen.getByText("MASTER-SKU-001")).toBeInTheDocument();
  });

  it("keeps private custom listings at the server-enforced quantity of one", () => {
    render(
      <ProductDetails
        product={productWithoutCustomVariants}
        basePath="/us/en"
        fixedQuantity
      />,
    );

    expect(screen.queryByTestId("quantity-picker")).not.toBeInTheDocument();
  });

  it("keeps personalization collapsed until the buyer expands it", async () => {
    const user = userEvent.setup();
    render(
      <ProductDetails product={productWithPersonalization} basePath="/us/en" />,
    );

    expect(screen.queryByLabelText(/Name to engrave/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "addPersonalization" }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "addPersonalization" }),
    );

    expect(screen.getByLabelText(/Name to engrave/)).toBeVisible();
  });

  it("opens a single optional photo upload in the compact product form", () => {
    render(
      <ProductDetails product={productWithOptionalFile} basePath="/us/en" />,
    );

    expect(screen.getByText("uploadFile")).toBeVisible();
    expect(screen.getByText("uploadFileHelp")).toBeVisible();
  });

  it("adds the configured item and routes Buy now to checkout", async () => {
    const user = userEvent.setup();
    addItem.mockResolvedValue({ success: true, cart: { id: "cart-123" } });
    render(
      <ProductDetails
        product={productWithoutCustomVariants}
        basePath="/us/en"
      />,
    );

    await user.click(screen.getByRole("button", { name: "buyNow" }));

    expect(addItem).toHaveBeenCalledWith(
      "variant-master",
      1,
      undefined,
      undefined,
    );
    expect(routerPush).toHaveBeenCalledWith("/us/en/checkout/cart-123");
  });

  it("provides a personalization fallback when the theme template omits the block", () => {
    render(
      <ProductDetails
        product={productWithPersonalization}
        basePath="/us/en"
        templateBlocks={[<h1 key="title">Configured title</h1>]}
      />,
    );

    expect(screen.getByLabelText(/Name to engrave/)).toBeVisible();
  });

  it("does not duplicate a personalization block configured by the theme", () => {
    render(
      <ProductDetails
        product={productWithPersonalization}
        basePath="/us/en"
        templateBlocks={[<h1 key="title">Configured title</h1>]}
        templatePersonalizationBlockPresent
      />,
    );

    expect(screen.queryByLabelText(/Name to engrave/)).not.toBeInTheDocument();
  });

  it("does not duplicate merchandising badges within the same PDP cluster", () => {
    const product = {
      ...productWithoutCustomVariants,
      merchandising_signals: [
        {
          key: "new",
          label: "New",
          priority: 40,
          source: "listing",
          presentation: "marketplace_badge",
        },
        {
          key: "bestseller",
          label: "Bestseller",
          priority: 80,
          source: "commerce",
          presentation: "marketplace_badge",
        },
      ],
    } as unknown as Product;

    render(<ProductDetails product={product} basePath="/us/en" />);

    expect(screen.getByText("Bestseller")).toBeVisible();
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("shows only one title-zone marketplace badge and hides the sale badge when the discount line is visible", () => {
    const salePrice = {
      amount_in_cents: 4200,
      compare_at_amount_in_cents: 8400,
      display_amount: "$42.00",
      display_compare_at_amount: "$84.00",
      currency: "USD",
    };
    const product = {
      ...productWithoutCustomVariants,
      price: salePrice,
      default_variant: {
        ...productWithoutCustomVariants.default_variant,
        price: salePrice,
      },
      merchandising_signals: [
        {
          key: "popular_now",
          label: "Popular now",
          priority: 70,
          source: "engagement_24h",
          presentation: "marketplace_badge",
        },
        {
          key: "new",
          label: "New",
          priority: 40,
          source: "listing",
          presentation: "marketplace_badge",
        },
        {
          key: "sale",
          label: "50% off",
          priority: 100,
          source: "promotion",
          presentation: "commerce_badge",
        },
        {
          key: "low_stock",
          label: "Only 3 left",
          priority: 90,
          source: "inventory",
          presentation: "availability_badge",
        },
      ],
    } as unknown as Product;

    render(<ProductDetails product={product} basePath="/us/en" />);

    expect(screen.getByText("Popular now")).toBeVisible();
    expect(screen.queryByText("New")).not.toBeInTheDocument();
    expect(screen.getByText("limitedTimeSale")).toBeVisible();
    expect(
      document.querySelector('[data-merchandising-pdp-signal="sale"]'),
    ).toBeNull();
    expect(screen.getByText("Only 3 left")).toBeVisible();
  });

  it("uses the configured product block order instead of the built-in detail column", () => {
    const product = {
      ...productWithoutCustomVariants,
      seller: { name: "Maker Shop", slug: "maker-shop" },
      description_html: "<p>Made by hand.</p>",
    } as Product;
    render(
      <ProductDetails
        product={product}
        basePath="/us/en"
        templateBlocks={[
          <p key="price" data-testid="configured-price">
            Configured price
          </p>,
          <h1 key="title">Configured title</h1>,
        ]}
        templateDescriptionBlockPresent
        templateMediaSettings={{ aspect_ratio: "square" }}
      />,
    );

    const content = screen.getByTestId("configured-price").parentElement;
    expect(content).toHaveAttribute("data-theme-product-block-layout");
    expect(content?.textContent?.indexOf("Configured price")).toBeLessThan(
      content?.textContent?.indexOf("Configured title") ?? -1,
    );
    expect(
      screen.getByRole("heading", { name: "Configured title" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Single Variant Product" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Maker Shop/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Made by hand.")).not.toBeInTheDocument();
  });

  it("does not duplicate description when description tabs are configured as a block", () => {
    const product = {
      ...productWithoutCustomVariants,
      description_html: "<p>Made by hand.</p>",
    } as Product;
    render(
      <ProductDetails
        product={product}
        basePath="/us/en"
        templateBlocks={[
          <div key="description-tabs">Configured description tabs</div>,
        ]}
        templateDescriptionBlockPresent
      />,
    );
    expect(screen.getByText("Configured description tabs")).toBeVisible();
    expect(screen.queryByText("Made by hand.")).not.toBeInTheDocument();
  });

  it("renders previous and next products when product navigation is enabled", () => {
    render(
      <ProductDetails
        product={productWithoutCustomVariants}
        basePath="/us/en"
        appearance={{ product_navigation: true }}
        productNavigation={{
          previous: { name: "Earlier item", slug: "earlier-item" },
          next: { name: "Later item", slug: "later-item" },
        }}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Product navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Earlier item/ })).toHaveAttribute(
      "href",
      "/us/en/products/earlier-item",
    );
    expect(screen.getByRole("link", { name: /Later item/ })).toHaveAttribute(
      "href",
      "/us/en/products/later-item",
    );
  });

  it("honors serialized false values for product page controls", () => {
    const product = {
      ...productWithoutCustomVariants,
      seller: { name: "Maker Shop", slug: "maker-shop", reviews_count: 0 },
      reviews_count: 5,
      average_rating: 4.8,
    } as Product;

    render(
      <ProductDetails
        product={product}
        basePath="/us/en"
        appearance={{ show_vendor: "false" }}
        globalSettings={{ show_reviews: "false" }}
      />,
    );

    expect(screen.queryByText("bySeller")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /reviewCount/ }),
    ).not.toBeInTheDocument();
  });

  it("renders the classic buy column with title, price, and add to cart", () => {
    render(
      <ProductDetails
        product={productWithoutCustomVariants}
        basePath="/us/en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Single Variant Product" }),
    ).toBeVisible();
    expect(screen.getByText("$25.00")).toBeVisible();
    expect(screen.getByRole("button", { name: "addToCart" })).toBeVisible();
    expect(screen.getByRole("button", { name: "buyNow" })).toBeVisible();
    expect(screen.getByText("purchaseProtection")).toBeVisible();
    expect(screen.getByText("deliveryBody")).toBeVisible();
    expect(screen.getByText("inStock")).toBeVisible();
  });

  it("shows a configured estimated delivery range", () => {
    render(
      <ProductDetails
        product={{
          ...productWithoutCustomVariants,
          estimated_delivery_date_min: "2026-10-09",
          estimated_delivery_date_max: "2026-10-15",
        }}
        basePath="/us/en"
      />,
    );

    expect(screen.getByText("estimatedDelivery")).toBeVisible();
    expect(screen.queryByText("deliveryBody")).not.toBeInTheDocument();
  });
});
