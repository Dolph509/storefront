"use client";

import {
  Gem,
  Gift,
  Home,
  Palette,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Store,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LOCAL_CATEGORY_PILLS,
  LOCAL_RADIUS_OPTIONS,
  LOCAL_SORT_OPTIONS,
  type LocalCategoryId,
  type LocalRadiusMiles,
  type LocalSortId,
} from "@/lib/shops/local-marketplace";
import { cn } from "@/lib/utils";

const ICONS = {
  store: Store,
  gem: Gem,
  home: Home,
  palette: Palette,
  gift: Gift,
  shirt: Shirt,
  sparkles: Sparkles,
} as const;

interface LocalShopsCategoryPillsProps {
  activeCategory: LocalCategoryId;
  radiusMiles: LocalRadiusMiles;
  activeSort: LocalSortId;
  className?: string;
}

export function LocalShopsCategoryPills({
  activeCategory,
  radiusMiles,
  activeSort,
  className,
}: LocalShopsCategoryPillsProps) {
  const t = useTranslations("shops");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function selectCategory(category: LocalCategoryId) {
    pushParams((params) => {
      if (category === "all") params.delete("category");
      else params.set("category", category);
    });
  }

  return (
    <div
      className={cn("flex items-center gap-2 overflow-x-auto pb-1", className)}
    >
      {LOCAL_CATEGORY_PILLS.map((pill) => {
        const Icon = ICONS[pill.icon];
        const active = activeCategory === pill.id;
        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => selectCategory(pill.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-marketplace-brand bg-marketplace-brand text-marketplace-brand-foreground"
                : "border-[#e4ddd2] bg-white text-marketplace-foreground hover:border-marketplace-brand/40",
            )}
          >
            <Icon aria-hidden className="size-3.5" />
            {t(pill.labelKey)}
          </button>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e4ddd2] bg-white px-3.5 py-2 text-sm font-medium text-marketplace-foreground outline-none hover:border-marketplace-brand/40"
          aria-label={t("filtersLabel")}
        >
          <SlidersHorizontal aria-hidden className="size-3.5" />
          {t("filtersLabel")}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[14rem]">
          <DropdownMenuLabel>{t("radiusLabel")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={String(radiusMiles)}
            onValueChange={(value) => {
              pushParams((params) => {
                params.set("radius", value);
              });
            }}
          >
            {LOCAL_RADIUS_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option} value={String(option)}>
                {t("radiusOption", { miles: option })}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("sortLabel")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={activeSort}
            onValueChange={(value) => {
              pushParams((params) => {
                if (value === "nearest") params.delete("sort");
                else if (
                  (LOCAL_SORT_OPTIONS as readonly string[]).includes(value)
                ) {
                  params.set("sort", value);
                }
              });
            }}
          >
            <DropdownMenuRadioItem value="nearest">
              {t("sortNearest")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="rating">
              {t("sortRating")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="name">
              {t("sortName")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
