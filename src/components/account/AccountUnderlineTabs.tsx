"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AccountUnderlineTab = {
  href: string;
  label: ReactNode;
  /** Optional trailing content (e.g. unread badge). */
  endAdornment?: ReactNode;
  isActive: boolean;
};

/**
 * Horizontal underline tab strip for account sub-navigation.
 * Scrolls on small screens; active tab uses a brand underline inset from the edges.
 */
export function AccountUnderlineTabs({
  "aria-label": ariaLabel,
  tabs,
  className,
}: {
  "aria-label": string;
  tabs: AccountUnderlineTab[];
  className?: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn("relative mb-6 max-w-full min-w-0", className)}
    >
      <div
        className={cn(
          "max-w-full min-w-0 overflow-x-auto overscroll-x-contain",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          "mask-[linear-gradient(90deg,transparent,black_12px,black_calc(100%-12px),transparent)]",
          "sm:mask-none",
        )}
      >
        <ul className="flex w-max max-w-none items-stretch gap-0.5 border-b border-marketplace-border-subtle px-0.5">
          {tabs.map((tab) => (
            <li key={tab.href} className="flex">
              <Link
                href={tab.href}
                aria-current={tab.isActive ? "page" : undefined}
                className={cn(
                  "group relative inline-flex min-h-11 items-center gap-2 px-3.5 text-sm tracking-tight",
                  "text-marketplace-muted-foreground",
                  "transition-[color,background-color,transform] duration-150 ease-out",
                  "rounded-t-[var(--marketplace-radius-sm)]",
                  "hover:bg-marketplace-surface-warm/70 hover:text-marketplace-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketplace-brand focus-visible:ring-offset-2",
                  "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
                  tab.isActive &&
                    "font-semibold text-marketplace-brand hover:bg-transparent hover:text-marketplace-brand",
                )}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.endAdornment}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-marketplace-brand",
                    "origin-center scale-x-0 transition-transform duration-150 ease-out motion-reduce:transition-none",
                    tab.isActive && "scale-x-100",
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
