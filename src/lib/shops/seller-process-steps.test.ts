import { describe, expect, it } from "vitest";
import {
  buildSellerProcessSteps,
  sellerHasProcessSection,
} from "./seller-process-steps";

describe("buildSellerProcessSteps", () => {
  it("returns empty when fewer than two captioned photos", () => {
    expect(
      buildSellerProcessSteps([
        { url: "https://example.test/a.jpg", caption: "Only one" },
      ]),
    ).toEqual([]);
    expect(sellerHasProcessSection([])).toBe(false);
  });

  it("builds titled steps from captioned photos", () => {
    const steps = buildSellerProcessSteps([
      {
        url: "https://example.test/a.jpg",
        caption: "Local Clay. Sourced nearby.",
      },
      {
        url: "https://example.test/b.jpg",
        caption: "Hand Thrown. Shaped by hand.",
      },
      { url: "https://example.test/c.jpg", caption: "" },
    ]);

    expect(steps).toHaveLength(2);
    expect(steps[0]).toMatchObject({
      imageUrl: "https://example.test/a.jpg",
      title: "Local Clay",
      body: "Sourced nearby.",
    });
    expect(
      sellerHasProcessSection([
        {
          url: "https://example.test/a.jpg",
          caption: "Local Clay. Sourced nearby.",
        },
        {
          url: "https://example.test/b.jpg",
          caption: "Hand Thrown. Shaped by hand.",
        },
      ]),
    ).toBe(true);
  });
});
