import { afterEach, describe, expect, it, vi } from "vitest";
import { usesNativeProductPage } from "./native-product-page";

describe("usesNativeProductPage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enables native PDP when theme section chrome is off", () => {
    vi.stubEnv("THEME_SECTION_GROUPS_ENABLED", "0");
    expect(usesNativeProductPage(undefined)).toBe(true);
  });

  it("defers when theme builder blocks are provided", () => {
    vi.stubEnv("THEME_SECTION_GROUPS_ENABLED", "0");
    expect(usesNativeProductPage([])).toBe(false);
  });

  it("defers when theme section groups are enabled", () => {
    vi.stubEnv("THEME_SECTION_GROUPS_ENABLED", "1");
    expect(usesNativeProductPage(undefined)).toBe(false);
  });
});
