import type { ProductFiltersResponse } from "@spree/sdk";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ActiveFilters } from "@/types/filters";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

import { FilterBar } from "./ProductFilters";

const filtersData: ProductFiltersResponse = {
  filters: [],
  sort_options: [{ id: "newest" }],
  default_sort: "newest",
  total_count: 0,
};
const activeFilters: ActiveFilters = { optionValues: [] };

describe("collection filter layouts", () => {
  it("stacks filter controls in sidebar layouts and keeps a desktop drawer mode", () => {
    const sidebar = render(
      <FilterBar
        filtersData={filtersData}
        filtersLoading={false}
        activeFilters={activeFilters}
        totalCount={0}
        onFilterChange={vi.fn()}
        layout="left_sidebar"
      />,
    );
    expect(
      sidebar.container.querySelector("[data-theme-filter-controls]")
        ?.className,
    ).toContain("flex-col");
    sidebar.unmount();

    const drawer = render(
      <FilterBar
        filtersData={filtersData}
        filtersLoading={false}
        activeFilters={activeFilters}
        totalCount={0}
        onFilterChange={vi.fn()}
        layout="left_drawer"
      />,
    );
    const drawerRow = drawer.container.querySelector(
      "[data-theme-filter-drawer-trigger]",
    )?.parentElement;
    expect(drawerRow?.className).toContain("flex items-center");
    expect(drawerRow?.className).not.toContain("md:hidden");
  });
});
