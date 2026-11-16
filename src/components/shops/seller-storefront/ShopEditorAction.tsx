"use client";

import { LayoutGrid, LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";

type ShopEditorActionName =
  | "banner"
  | "banner-layout"
  | "featured"
  | "featured-layout"
  | "shop-content"
  | "policies";

const icons = {
  banner: Pencil,
  "banner-layout": LayoutTemplate,
  featured: Plus,
  "featured-layout": LayoutGrid,
  "shop-content": Pencil,
  policies: Pencil,
} as const;

export function ShopEditorAction({
  action,
  label,
  icon,
  className = "",
  showLabel = false,
}: {
  action: ShopEditorActionName;
  label: string;
  icon?: "plus" | "remove";
  className?: string;
  showLabel?: boolean;
}) {
  const Icon =
    icon === "plus" ? Plus : icon === "remove" ? Trash2 : icons[action];

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage({ source: "spree-shop-editor", action }, "*");
      }}
    >
      <Icon className="size-4" aria-hidden />
      {showLabel ? (
        <span>{label}</span>
      ) : icon ? (
        <span className="sr-only">{label}</span>
      ) : null}
    </button>
  );
}
