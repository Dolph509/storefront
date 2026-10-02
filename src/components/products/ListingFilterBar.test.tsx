import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/us/en/collections/gifts",
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/components/products/filters", () => ({
  FilterBar: ({ layout }: { layout: string }) => (
    <div data-testid="filter-layout" data-filter-layout={layout} />
  ),
}));

import { ListingFilterBar } from "./ListingFilterBar";

describe("ListingFilterBar", () => {
  it.each([
    "horizontal",
    "left_sidebar",
    "right_sidebar",
    "left_drawer",
  ] as const)("passes the %s layout to the filter controls", (filterStyle) => {
    render(
      <ListingFilterBar
        filtersData={null}
        activeFilters={{ optionValues: [] }}
        totalCount={0}
        filterStyle={filterStyle}
      />,
    );

    expect(screen.getByTestId("filter-layout")).toHaveAttribute(
      "data-filter-layout",
      filterStyle,
    );
  });
});
