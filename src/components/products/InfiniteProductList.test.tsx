import type { PaginatedResponse, Product } from "@spree/sdk";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InfiniteProductList } from "@/components/products/InfiniteProductList";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

vi.mock("@/components/products/ProductCard", () => ({
  ProductCard: ({ product }: { product: Product }) => <p>{product.name}</p>,
}));

const product = (id: string, name: string) => ({ id, name }) as Product;
const page = (
  products: Product[],
  pageNumber: number,
  pages: number,
): PaginatedResponse<Product> => ({
  data: products,
  meta: {
    page: pageNumber,
    limit: 1,
    count: pages,
    pages,
    from: 1,
    to: 1,
    in: 1,
    previous: null,
    next: null,
  },
});

describe("InfiniteProductList pagination modes", () => {
  it("replaces the visible products when numbered pagination is selected", async () => {
    const fetchPage = vi.fn(async ({ page: pageNumber }: { page?: number }) =>
      page([product("p2", "Page two product")], pageNumber || 2, 3),
    );
    render(
      <InfiniteProductList
        initialProducts={[product("p1", "Page one product")]}
        initialPage={1}
        totalPages={3}
        listParams={{ limit: 1 }}
        fetchPage={fetchPage}
        basePath="/us/en"
        paginationStyle="pages"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(await screen.findByText("Page two product")).toBeInTheDocument();
    expect(screen.queryByText("Page one product")).not.toBeInTheDocument();
    expect(fetchPage).toHaveBeenCalledWith({ limit: 1, page: 2 });
  });

  it("uses the shared theme grid so global column settings apply to listings", () => {
    const { container } = render(
      <InfiniteProductList
        initialProducts={[product("p1", "Page one product")]}
        initialPage={1}
        totalPages={1}
        listParams={{ limit: 1 }}
        fetchPage={vi.fn(async () => page([], 1, 1))}
        basePath="/us/en"
        paginationStyle="pages"
      />,
    );

    expect(container.querySelector(".theme-product-grid")).not.toBeNull();
  });
});
