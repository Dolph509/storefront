import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EmptyStateIllustration,
  emptyStateNames,
} from "./EmptyStateIllustration";

describe("EmptyStateIllustration", () => {
  it("renders every supplied drawing", () => {
    expect(emptyStateNames).toHaveLength(36);
    for (const name of emptyStateNames) {
      const { container, unmount } = render(
        <EmptyStateIllustration name={name} />,
      );
      expect(
        container.querySelector("svg g")?.children.length,
        name,
      ).toBeGreaterThan(0);
      unmount();
    }
  });

  it("supports an accessible title", () => {
    render(<EmptyStateIllustration name="empty-cart" title="Empty cart" />);
    expect(screen.getByRole("img", { name: "Empty cart" })).toBeInTheDocument();
  });

  it("keeps the new artwork in its own coordinate system", () => {
    const { container } = render(
      <EmptyStateIllustration name="payment-failed" />,
    );
    expect(container.querySelector("svg")).toHaveAttribute(
      "viewBox",
      "0 0 128 128",
    );
    expect(container.querySelector("g")).toHaveAttribute("stroke-width", "3.4");
  });
});
