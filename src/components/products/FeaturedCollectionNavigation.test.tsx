import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeaturedCollectionNavigation } from "./FeaturedCollectionNavigation";

describe("FeaturedCollectionNavigation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLElement.prototype, "scrollBy");
  });

  it("pages the carousel forward and backward on repeated arrow clicks", () => {
    const scrollBy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1000);
    render(
      <>
        <div id="featured-products">
          <div />
        </div>
        <FeaturedCollectionNavigation listId="featured-products" count={8} />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next products" }));
    fireEvent.click(screen.getByRole("button", { name: "Next products" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous products" }));

    expect(scrollBy).toHaveBeenCalledTimes(3);
    expect(scrollBy.mock.calls.map(([options]) => options)).toEqual([
      { left: 850, behavior: "smooth" },
      { left: 850, behavior: "smooth" },
      { left: -850, behavior: "smooth" },
    ]);
  });

  it("uses the selected background style for dot navigation", () => {
    render(
      <>
        <div id="featured-products">
          <div />
        </div>
        <FeaturedCollectionNavigation
          listId="featured-products"
          count={2}
          icon="dots"
          background="circle"
        />
      </>,
    );

    expect(screen.getByRole("button", { name: "Go to product 1" })).toHaveClass(
      "rounded-full",
      "bg-marketplace-surface",
    );
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-theme-carousel-navigation",
    );
  });

  it("marks arrow controls for global visibility and color settings", () => {
    render(
      <>
        <div id="featured-products">
          <div />
        </div>
        <FeaturedCollectionNavigation listId="featured-products" count={2} />
      </>,
    );

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-theme-carousel-navigation",
    );
  });

  it("uses slideshow-specific accessible labels when used for slides", () => {
    render(
      <>
        <div id="slideshow">
          <div />
        </div>
        <FeaturedCollectionNavigation
          listId="slideshow"
          count={2}
          label="Slideshow"
          itemLabel="slide"
        />
      </>,
    );

    expect(
      screen.getByRole("navigation", { name: "Slideshow" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next slides" }),
    ).toBeInTheDocument();
  });
});
