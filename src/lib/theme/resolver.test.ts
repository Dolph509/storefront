import { describe, expect, it } from "vitest";
import { themeGroupHasContent } from "./resolver";

describe("themeGroupHasContent", () => {
  it("is false for empty groups", () => {
    expect(themeGroupHasContent(undefined)).toBe(false);
    expect(themeGroupHasContent({ order: [] })).toBe(false);
  });

  it("is true when order has sections", () => {
    expect(themeGroupHasContent({ order: ["header-main"] })).toBe(true);
  });
});
