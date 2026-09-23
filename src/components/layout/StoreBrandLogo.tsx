import Link from "next/link";
import { SpreeIcon } from "@/components/icons";
import { getStoreDescription, getStoreName } from "@/lib/store";

interface StoreBrandLogoProps {
  basePath: string;
  tagline?: string;
  compact?: boolean;
  /** Etsy-style orange wordmark without icon or tagline. */
  appearance?: "default" | "etsy";
}

export function StoreBrandLogo({
  basePath,
  tagline,
  compact = false,
  appearance = "default",
}: StoreBrandLogoProps) {
  const storeName = getStoreName();
  const defaultTagline = getStoreDescription();
  const lines = tagline ?? defaultTagline;

  const isEtsy = appearance === "etsy";

  return (
    <Link
      href={basePath || "/"}
      className={
        isEtsy
          ? "shrink-0 rounded-sm font-display text-[2rem] font-semibold leading-none tracking-tight text-[#f1641e] focus-visible:outline-2 focus-visible:outline-[#f1641e] sm:text-[2.15rem]"
          : compact
            ? "shrink-0 rounded-sm font-display text-[2.15rem] font-semibold leading-none tracking-tight text-marketplace-brand focus-visible:outline-2 focus-visible:outline-marketplace-brand"
            : "group flex min-w-0 max-w-[11rem] items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-marketplace-brand sm:max-w-none sm:gap-3"
      }
    >
      {isEtsy || compact ? (
        <span>{storeName}</span>
      ) : (
        <>
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-marketplace-brand text-marketplace-brand-foreground sm:size-11"
            aria-hidden
          >
            <SpreeIcon name="handmade" className="size-5 sm:size-[1.35rem]" />
          </span>
          <span className="min-w-0 text-left leading-tight">
            <span className="block truncate font-display text-xl font-semibold tracking-tight text-marketplace-brand sm:text-[1.65rem]">
              {storeName}
            </span>
            <span className="mt-0.5 line-clamp-2 text-[10px] font-medium leading-snug text-marketplace-muted-foreground sm:text-[11px]">
              {lines}
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
