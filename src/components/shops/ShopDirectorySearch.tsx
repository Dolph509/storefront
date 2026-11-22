"use client";

import { Search } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

interface ShopDirectorySearchProps {
  initialQuery?: string;
}

export function ShopDirectorySearch({
  initialQuery = "",
}: ShopDirectorySearchProps) {
  const t = useTranslations("shops");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const nextQuery = query.trim();
    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }
    params.delete("page");
    // Keep location filters; drop the truncated "view=all" only when searching.
    const qs = params.toString();
    window.location.assign(
      qs ? `${pathname}?${qs}#discover-more` : `${pathname}#discover-more`,
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-xl">
      <label htmlFor="shop-directory-search" className="sr-only">
        {t("searchLabel")}
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-marketplace-muted-foreground"
      />
      <input
        id="shop-directory-search"
        name="q"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className="h-11 w-full rounded-full border border-marketplace-border bg-marketplace-surface-elevated pl-10 pr-24 text-sm text-marketplace-foreground outline-none transition-[border-color,box-shadow] placeholder:text-marketplace-muted-foreground focus:border-marketplace-brand focus:ring-2 focus:ring-marketplace-brand/15"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full bg-marketplace-brand px-4 text-xs font-semibold text-marketplace-brand-foreground transition-colors hover:bg-marketplace-brand-accent-hover"
      >
        {t("searchSubmit")}
      </button>
    </form>
  );
}
