import Link from "next/link";
import { getStoreDescription, getStoreName } from "@/lib/store";

interface StoreBrandLogoProps {
  basePath: string;
  tagline?: string;
  compact?: boolean;
  logoImageUrl?: string;
  logoImageAlt?: string;
  appearance?: "default" | "etsy";
  logoColor?: string;
}

function OddkeepsMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2.5L21.5 12L12 21.5L2.5 12L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" fill="var(--marketplace-brand-accent)" />
    </svg>
  );
}

export function StoreBrandLogo({
  basePath,
  tagline,
  compact = false,
  logoImageUrl,
  logoImageAlt,
  appearance = "default",
  logoColor,
}: StoreBrandLogoProps) {
  const storeName = getStoreName();
  const defaultTagline = getStoreDescription();
  const lines = tagline ?? defaultTagline;
  const isCompactWordmark = appearance === "etsy" || compact;

  return (
    <Link
      data-theme-brand-logo
      style={logoColor ? { color: logoColor } : undefined}
      href={basePath || "/"}
      className={
        isCompactWordmark
          ? "group inline-flex shrink-0 items-center gap-2 rounded-sm font-display text-[1.5rem] font-medium leading-none tracking-[-0.03em] text-marketplace-brand transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand sm:text-[1.85rem]"
          : "group flex min-w-0 max-w-[12rem] items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand sm:max-w-none sm:gap-3"
      }
    >
      {isCompactWordmark ? (
        <>
          <span
            data-theme-brand-logo-text
            className="inline-flex items-center gap-2"
            style={{ display: logoImageUrl ? "none" : undefined }}
          >
            <OddkeepsMark className="size-5 shrink-0 text-marketplace-brand sm:size-[1.35rem]" />
            <span>{storeName}</span>
          </span>
          <img
            data-theme-brand-logo-image
            src={logoImageUrl || undefined}
            alt={logoImageAlt || storeName}
            width={180}
            height={60}
            className="max-h-[2.75rem] w-auto max-w-[11rem] object-contain"
            style={{ display: logoImageUrl ? undefined : "none" }}
          />
        </>
      ) : (
        <>
          {logoImageUrl ? (
            <img
              data-theme-brand-logo-image
              src={logoImageUrl}
              alt={logoImageAlt || storeName}
              width={180}
              height={60}
              className="max-h-[2.75rem] w-auto max-w-[11rem] object-contain"
            />
          ) : (
            <>
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-marketplace-border bg-marketplace-surface-subtle text-marketplace-brand sm:size-10"
                aria-hidden="true"
              >
                <OddkeepsMark className="size-5" />
              </span>
              <span className="min-w-0 text-left leading-tight">
                <span
                  data-theme-brand-logo-text
                  className="block truncate font-display text-xl font-medium tracking-[-0.03em] text-marketplace-brand sm:text-[1.6rem]"
                >
                  {storeName}
                </span>
                <span className="mt-0.5 line-clamp-1 text-[11px] font-normal text-marketplace-muted-foreground">
                  {lines}
                </span>
              </span>
            </>
          )}
        </>
      )}
    </Link>
  );
}
