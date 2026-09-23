import Link from "next/link";
import { resolveThemeSetting } from "@/lib/theme/dynamic-source";
import type { ThemeBlockInstance, ThemeRenderContext } from "@/lib/theme/types";

export function ThemeBlockRenderer({
  block,
  context,
}: {
  block: ThemeBlockInstance;
  context: ThemeRenderContext;
}) {
  if (block.disabled) return null;

  const settings = block.settings || {};
  switch (block.type) {
    case "heading": {
      const text = String(resolveThemeSetting(settings.text, context, ""));
      if (!text) return null;
      return (
        <h3 className="font-display text-xl font-semibold text-marketplace-brand">
          {text}
        </h3>
      );
    }
    case "text": {
      const text = String(resolveThemeSetting(settings.text, context, ""));
      if (!text) return null;
      return <p className="text-marketplace-muted-foreground">{text}</p>;
    }
    case "button": {
      const label = String(resolveThemeSetting(settings.label, context, ""));
      const href = String(settings.link || context.basePath);
      if (!label) return null;
      return (
        <Link
          className="inline-block border-b border-marketplace-brand pb-1 text-marketplace-brand"
          href={href}
        >
          {label}
        </Link>
      );
    }
    case "spacer": {
      const size = String(settings.size || "medium");
      const height =
        size === "small" ? "h-4" : size === "large" ? "h-12" : "h-8";
      return <div className={height} aria-hidden="true" />;
    }
    default:
      if (process.env.NODE_ENV === "development") {
        console.warn(`[theme] unknown block type: ${block.type}`);
      }
      return null;
  }
}
