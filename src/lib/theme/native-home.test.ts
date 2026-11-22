import { describe, expect, it } from "vitest";
import spreeHomeDefault from "@/lib/theme/spree-6-home-default.json";
import { usesNativeHome } from "./native-home";

describe("usesNativeHome", () => {
  it("treats the bootstrap home document as native", () => {
    expect(usesNativeHome(spreeHomeDefault)).toBe(true);
  });

  it("treats an empty saved template as native", () => {
    expect(usesNativeHome({ order: [], sections: {} })).toBe(true);
  });

  it("treats a merchant-customized template as theme-driven", () => {
    const customized = structuredClone(spreeHomeDefault);
    customized.sections["home-hero"].settings.heading = "Autumn studio sale";
    expect(usesNativeHome(customized)).toBe(false);
  });
});
