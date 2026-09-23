import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { iconNames } from "./icon-paths.generated";
import { SpreeIcon } from "./SpreeIcon";

describe("SpreeIcon", () => {
  it("renders every icon from the contact sheet", () => {
    for (const name of iconNames) {
      const { container, unmount } = render(<SpreeIcon name={name} />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("viewBox"), name).toBe("1 1 22 22");
      expect(svg?.children.length, name).toBeGreaterThan(0);
      unmount();
    }
  });

  it("renders a filled state and an accessible title", () => {
    render(
      <SpreeIcon name="heart" variant="filled" title="Favorite" size={16} />,
    );
    const icon = screen.getByRole("img", { name: "Favorite" });
    expect(icon).toHaveAttribute("width", "16");
    expect(icon.querySelector("path")).toHaveAttribute("fill", "currentColor");
  });

  it("preserves existing filled favorite styling", () => {
    const { container } = render(
      <SpreeIcon name="heart" className="fill-red-500 text-red-500" />,
    );
    expect(container.querySelector("path")).toHaveAttribute(
      "fill",
      "currentColor",
    );
  });

  it("renders a slightly larger, heavier outline", () => {
    const { container } = render(<SpreeIcon name="heart" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "viewBox",
      "1 1 22 22",
    );
    expect(container.querySelector("svg")).toHaveStyle({ scale: "1.18" });
    expect(container.querySelector("path")).toHaveAttribute(
      "stroke-width",
      "2.3",
    );
  });
});
