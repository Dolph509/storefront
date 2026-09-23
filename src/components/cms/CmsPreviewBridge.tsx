"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { CmsTheme } from "./types";

export type PreviewUpdate = {
  type: "CMS_PREVIEW_UPDATE";
  pageId: string;
  revision?: number;
  theme?: CmsTheme["settings"];
};

const colorNames = new Set([
  "brand",
  "background",
  "surface",
  "surface_warm",
  "foreground",
  "muted",
  "border",
  "accent",
  "sale",
  "success",
  "danger",
]);
const radii: Record<string, string> = {
  none: "0",
  small: "0.25rem",
  medium: "0.5rem",
  large: "0.75rem",
};
const spacing: Record<string, string> = {
  compact: "2rem",
  comfortable: "3rem",
  spacious: "5rem",
};

export function isTrustedPreviewMessage(
  event: Pick<MessageEvent, "origin" | "source" | "data">,
  editorOrigin: string,
  pageId: string,
  parent: Window,
): event is MessageEvent<PreviewUpdate> {
  const data = event.data;
  return (
    !!editorOrigin &&
    event.origin === editorOrigin &&
    event.source === parent &&
    !!data &&
    typeof data === "object" &&
    data.type === "CMS_PREVIEW_UPDATE" &&
    data.pageId === pageId
  );
}

export function applyThemePreview(
  element: HTMLElement,
  theme: CmsTheme["settings"],
) {
  for (const [name, value] of Object.entries(theme.colors || {})) {
    if (colorNames.has(name) && /^#[0-9a-fA-F]{6}$/.test(value)) {
      element.style.setProperty(
        `--marketplace-${name.replaceAll("_", "-")}`,
        value,
      );
    }
  }
  for (const [name, value] of Object.entries(theme.shape || {})) {
    if (
      ["radius_sm", "radius_md", "radius_lg"].includes(name) &&
      radii[value]
    ) {
      element.style.setProperty(
        `--marketplace-${name.replaceAll("_", "-")}`,
        radii[value],
      );
    }
  }
  const width = theme.layout?.page_width;
  if (width === "standard" || width === "wide")
    element.style.maxWidth = width === "standard" ? "1200px" : "1440px";
  const sectionSpacing = theme.layout?.section_spacing;
  if (sectionSpacing && spacing[sectionSpacing])
    element.style.setProperty("--cms-section-spacing", spacing[sectionSpacing]);
}

export function CmsPreviewBridge({
  editorOrigin,
  pageId,
}: {
  editorOrigin: string | null;
  pageId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!editorOrigin || window.parent === window) return;
    const onMessage = (event: MessageEvent) => {
      if (!isTrustedPreviewMessage(event, editorOrigin, pageId, window.parent))
        return;
      const main = document.querySelector<HTMLElement>("[data-cms-page-id]");
      if (main && event.data.theme) applyThemePreview(main, event.data.theme);
      if (typeof event.data.revision === "number") router.refresh();
    };
    const onClick = (event: MouseEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-cms-section-id]")
          : null;
      if (!target) return;
      event.preventDefault();
      window.parent.postMessage(
        {
          type: "CMS_PREVIEW_SELECT",
          pageId,
          sectionId: target.dataset.cmsSectionId,
        },
        editorOrigin,
      );
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, [editorOrigin, pageId, router]);

  return null;
}
