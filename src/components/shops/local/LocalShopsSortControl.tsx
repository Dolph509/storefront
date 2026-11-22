"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LOCAL_SORT_OPTIONS,
  type LocalSortId,
} from "@/lib/shops/local-marketplace";
import { cn } from "@/lib/utils";

const SORT_LABEL_KEYS: Record<LocalSortId, string> = {
  nearest: "sortNearest",
  rating: "sortRating",
  name: "sortName",
};

interface LocalShopsSortControlProps {
  activeSort: LocalSortId;
  className?: string;
}

export function LocalShopsSortControl({
  activeSort,
  className,
}: LocalShopsSortControlProps) {
  const t = useTranslations("shops");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setSort(sort: string) {
    const next = (LOCAL_SORT_OPTIONS as readonly string[]).includes(sort)
      ? (sort as LocalSortId)
      : "nearest";
    const params = new URLSearchParams(searchParams.toString());
    if (next === "nearest") params.delete("sort");
    else params.set("sort", next);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium text-marketplace-muted-foreground outline-none transition-colors hover:text-marketplace-foreground",
          className,
        )}
      >
        {t("sortedBy", { sort: t(SORT_LABEL_KEYS[activeSort]) })}
        <ChevronDown aria-hidden className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        <DropdownMenuRadioGroup value={activeSort} onValueChange={setSort}>
          {LOCAL_SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {t(SORT_LABEL_KEYS[option])}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
