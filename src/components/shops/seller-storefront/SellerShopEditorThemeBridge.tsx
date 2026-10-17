"use client";

import { useEffect, useRef } from "react";

const editorMessageSource = "spree-shop-editor-parent";

export function SellerShopEditorThemeBridge({ enabled }: { enabled: boolean }) {
  const bridgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;

    function onMessage(event: MessageEvent) {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (
        message?.source !== editorMessageSource ||
        message.action !== "patch" ||
        !Object.hasOwn(message.payload ?? {}, "shop_accent_color")
      ) {
        return;
      }

      const header = bridgeRef.current?.closest<HTMLElement>(
        "header[data-theme-seller-identity]",
      );
      if (!header) return;
      const rawColor = message.payload.shop_accent_color;
      const color = typeof rawColor === "string" ? rawColor.trim() : "";
      if (color && !/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color)) return;

      if (!color) {
        for (const property of themeProperties) {
          header.style.removeProperty(property);
        }
        return;
      }

      const lightAccent = isLightAccent(color);
      const textColor = lightAccent ? "#222222" : "#ffffff";
      const actionBackground = "#ffffff";
      const actionBorder = lightAccent ? color : "#ffffff";
      const actionText = lightAccent ? "#222222" : color;
      header.style.setProperty("--marketplace-seller-accent", color);
      header.style.setProperty("--marketplace-seller-accent-text", textColor);
      header.style.setProperty(
        "--marketplace-seller-accent-muted",
        textColor === "#222222"
          ? "rgb(34 34 34 / 72%)"
          : "rgb(255 255 255 / 82%)",
      );
      header.style.setProperty(
        "--marketplace-seller-action-bg",
        actionBackground,
      );
      header.style.setProperty(
        "--marketplace-seller-action-border",
        actionBorder,
      );
      header.style.setProperty("--marketplace-seller-action-text", actionText);
      header.style.setProperty(
        "--marketplace-seller-rating-star",
        textColor === "#ffffff" ? "#ffffff" : "#5a3c12",
      );
      header.style.setProperty(
        "--marketplace-seller-rating-empty",
        textColor === "#ffffff"
          ? "rgb(255 255 255 / 55%)"
          : "var(--marketplace-border)",
      );
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [enabled]);

  return <span ref={bridgeRef} hidden aria-hidden="true" />;
}

const themeProperties = [
  "--marketplace-seller-accent",
  "--marketplace-seller-accent-text",
  "--marketplace-seller-accent-muted",
  "--marketplace-seller-action-bg",
  "--marketplace-seller-action-border",
  "--marketplace-seller-action-text",
  "--marketplace-seller-rating-star",
  "--marketplace-seller-rating-empty",
];

function isLightAccent(hex: string): boolean {
  const normalized = hex.slice(1);
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;
  const value = Number.parseInt(expanded, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}
