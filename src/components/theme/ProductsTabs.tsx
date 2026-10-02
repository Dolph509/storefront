"use client";

import type { Product } from "@spree/sdk";
import { useState } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";

export type ProductTab = { id: string; label: string; products: Product[] };

export function ProductsTabs({
  tabs,
  basePath,
  currency,
  listId,
  columns,
  gap,
}: {
  tabs: ProductTab[];
  basePath: string;
  currency?: string;
  listId: string;
  columns?: number;
  gap?: number;
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id || "");
  const active = tabs.find((tab) => tab.id === activeId) || tabs[0];
  if (!active) return null;
  return (
    <div>
      <div
        role="tablist"
        aria-label="Product collections"
        className="mb-5 flex gap-2 overflow-x-auto border-b border-marketplace-border"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`${listId}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active.id === tab.id}
            aria-controls={`${listId}-panel-${tab.id}`}
            onClick={() => setActiveId(tab.id)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm ${active.id === tab.id ? "border-marketplace-brand font-semibold text-marketplace-brand" : "border-transparent text-marketplace-muted-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`${listId}-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`${listId}-tab-${active.id}`}
      >
        <ProductGrid
          products={active.products}
          basePath={basePath}
          currency={currency}
          columns={columns}
          gap={gap}
          listId={`${listId}-${active.id}`}
          listName={active.label}
        />
      </div>
    </div>
  );
}
