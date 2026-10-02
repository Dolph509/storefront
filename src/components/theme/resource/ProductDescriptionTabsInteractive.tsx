"use client";

import { useState } from "react";

type TabId = "description" | "details" | "reviews";

export function ProductDescriptionTabsInteractive({
  descriptionLabel,
  detailsLabel,
  reviewsLabel,
  descriptionHtml,
  details,
  reviewCount,
}: {
  descriptionLabel: string;
  detailsLabel: string;
  reviewsLabel: string;
  descriptionHtml: string;
  details: string[];
  reviewCount: number;
}) {
  const [active, setActive] = useState<TabId>("description");
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "description", label: descriptionLabel },
    { id: "details", label: detailsLabel },
    { id: "reviews", label: `${reviewsLabel} (${reviewCount})` },
  ];
  const activeIndex = tabs.findIndex((tab) => tab.id === active);

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      data-theme-product-description-tabs
    >
      <div
        role="tablist"
        aria-label="Product information"
        className="flex flex-wrap gap-2 border-b border-marketplace-border"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`product-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`product-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowRight" && event.key !== "ArrowLeft")
                return;
              event.preventDefault();
              const nextIndex =
                (activeIndex +
                  (event.key === "ArrowRight" ? 1 : tabs.length - 1)) %
                tabs.length;
              setActive(tabs[nextIndex].id);
              document
                .getElementById(`product-tab-${tabs[nextIndex].id}`)
                ?.focus();
            }}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${active === tab.id ? "border-marketplace-brand text-marketplace-foreground" : "border-transparent text-marketplace-muted-foreground hover:text-marketplace-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`product-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`product-tab-${tab.id}`}
          hidden={active !== tab.id}
          tabIndex={0}
          className="py-5 text-sm text-marketplace-foreground"
        >
          {tab.id === "description" ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : null}
          {tab.id === "details" ? (
            details.length ? (
              <ul className="space-y-2">
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : (
              <p>No additional details.</p>
            )
          ) : null}
          {tab.id === "reviews" ? (
            <a href="#reviews" className="underline">
              Read customer reviews
            </a>
          ) : null}
        </div>
      ))}
    </section>
  );
}
