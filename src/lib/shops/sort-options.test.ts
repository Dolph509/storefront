import { describe, expect, it } from "vitest";
import { parseShopDirectorySort } from "./sort-options";

describe("parseShopDirectorySort", () => {
  it("defaults to top rated", () => {
    expect(parseShopDirectorySort(undefined)).toBe("-average_rating");
    expect(parseShopDirectorySort("invalid")).toBe("-average_rating");
  });

  it("accepts supported sort keys", () => {
    expect(parseShopDirectorySort("-followers_count")).toBe("-followers_count");
    expect(parseShopDirectorySort("name")).toBe("name");
  });
});
