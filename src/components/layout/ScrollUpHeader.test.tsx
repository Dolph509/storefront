import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollUpHeader } from "./ScrollUpHeader";

describe("ScrollUpHeader", () => {
  it("hides on downward scrolling and reappears when scrolling up", () => {
    render(
      <ScrollUpHeader>
        <header
          data-theme-header
          data-sticky-enabled="true"
          data-sticky-behavior="scroll_up"
          data-transparent="false"
        >
          Store header
        </header>
      </ScrollUpHeader>,
    );

    const wrapper = screen.getByText("Store header").parentElement;
    expect(wrapper).toHaveClass("sticky", "translate-y-0");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 120,
    });
    fireEvent.scroll(window);
    expect(wrapper).toHaveClass("-translate-y-full");

    Object.defineProperty(window, "scrollY", { configurable: true, value: 80 });
    fireEvent.scroll(window);
    expect(wrapper).toHaveClass("translate-y-0");
  });
});
