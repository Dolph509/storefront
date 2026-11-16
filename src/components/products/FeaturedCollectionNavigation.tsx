"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function scrollToItem(listId: string, index: number) {
  const list = document.getElementById(listId);
  const item = list?.children.item(index);
  item?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "start",
  });
}

function scrollByPage(listId: string, direction: -1 | 1) {
  const list = document.getElementById(listId);
  if (!list) return;
  const firstItemWidth =
    list.children.item(0)?.getBoundingClientRect().width ?? 0;
  const distance = Math.max(list.clientWidth * 0.85, firstItemWidth);
  list.scrollBy({ left: direction * distance, behavior: "smooth" });
}

export function FeaturedCollectionNavigation({
  listId,
  count,
  icon = "arrows",
  background = "none",
  label = "Featured products",
  itemLabel = "product",
}: {
  listId: string;
  count: number;
  icon?: string;
  background?: string;
  label?: string;
  itemLabel?: string;
}) {
  const buttonClass = `inline-flex size-9 items-center justify-center text-marketplace-foreground ${background === "circle" ? "rounded-full border border-marketplace-border bg-marketplace-surface" : background === "square" ? "rounded-md border border-marketplace-border bg-marketplace-surface" : "border-0 bg-transparent"}`;

  if (icon === "dots")
    return (
      <nav
        aria-label={label}
        data-theme-carousel-navigation
        className="mt-4 flex justify-center gap-2"
      >
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to ${itemLabel} ${index + 1}`}
            aria-controls={listId}
            onClick={() => scrollToItem(listId, index)}
            className={`flex size-8 items-center justify-center ${buttonClass}`}
          >
            <span className="size-2.5 rounded-full bg-marketplace-foreground/50" />
          </button>
        ))}
      </nav>
    );

  return (
    <nav
      aria-label={label}
      data-theme-carousel-navigation
      className="mt-4 flex justify-end gap-2"
    >
      <button
        type="button"
        aria-label={`Previous ${itemLabel}s`}
        aria-controls={listId}
        onClick={() => scrollByPage(listId, -1)}
        className={buttonClass}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        aria-label={`Next ${itemLabel}s`}
        aria-controls={listId}
        onClick={() => scrollByPage(listId, 1)}
        className={buttonClass}
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
}
