import { describe, expect, it } from "vitest";
import { applyThemePreview, isTrustedPreviewMessage } from "./CmsPreviewBridge";

describe("CMS preview bridge", () => {
  it("accepts only the signed editor origin, parent frame, and matching page", () => {
    const parent = window;
    const message = {
      origin: "https://admin.example",
      source: parent,
      data: { type: "CMS_PREVIEW_UPDATE", pageId: "cmsp_1", revision: 2 },
    };
    expect(
      isTrustedPreviewMessage(
        message,
        "https://admin.example",
        "cmsp_1",
        parent,
      ),
    ).toBe(true);
    expect(
      isTrustedPreviewMessage(
        { ...message, origin: "https://attacker.example" },
        "https://admin.example",
        "cmsp_1",
        parent,
      ),
    ).toBe(false);
    expect(
      isTrustedPreviewMessage(
        { ...message, source: null },
        "https://admin.example",
        "cmsp_1",
        parent,
      ),
    ).toBe(false);
    expect(
      isTrustedPreviewMessage(
        { ...message, data: { type: "UNKNOWN", pageId: "cmsp_1" } },
        "https://admin.example",
        "cmsp_1",
        parent,
      ),
    ).toBe(false);
    expect(
      isTrustedPreviewMessage(
        message,
        "https://admin.example",
        "cmsp_2",
        parent,
      ),
    ).toBe(false);
  });

  it("applies only allowlisted theme values to the preview", () => {
    const element = document.createElement("main");
    applyThemePreview(element, {
      colors: { brand: "#3b3044", malicious: "url(https://example.com)" },
      shape: { radius_md: "medium" },
      layout: { page_width: "standard", section_spacing: "compact" },
    });
    expect(element.style.getPropertyValue("--marketplace-brand")).toBe(
      "#3b3044",
    );
    expect(element.style.getPropertyValue("--marketplace-malicious")).toBe("");
    expect(element.style.maxWidth).toBe("1200px");
    expect(element.style.getPropertyValue("--cms-section-spacing")).toBe(
      "2rem",
    );
  });
});
