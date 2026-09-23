"use client";

import type { Category } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronDown } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MarketplaceBrowseMenuProps {
  rootCategories: Category[];
  basePath: string;
}

export function MarketplaceBrowseMenu({
  rootCategories,
  basePath,
}: MarketplaceBrowseMenuProps) {
  const t = useTranslations("header");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-[var(--marketplace-radius-sm)] px-3 font-medium text-marketplace-brand hover:bg-marketplace-surface-warm"
        >
          {t("browse")}
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={0}
        collisionPadding={0}
        className="z-[100] w-[min(1440px,calc(100vw-1.5rem))] rounded-none border-x-0 border-t border-marketplace-border-subtle bg-white p-6 text-marketplace-foreground shadow-[0_12px_40px_oklch(0.28_0.06_305/12%)]"
      >
        <div className="flex items-center justify-between border-b border-marketplace-border-subtle pb-4">
          <h2 className="font-semibold">{t("browseCategories")}</h2>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link
              href={`${basePath}/shops`}
              className="text-marketplace-brand underline-offset-4 hover:underline"
            >
              {t("shops")}
            </Link>
            <Link
              href={`${basePath}/products`}
              className="text-marketplace-brand underline-offset-4 hover:underline"
            >
              {t("allCategories")}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-5 lg:grid-cols-3">
          {rootCategories.map((category) => (
            <div key={category.id}>
              <Link
                href={`${basePath}/c/${category.permalink}`}
                className="font-medium hover:text-marketplace-brand"
              >
                {category.name}
              </Link>
              {category.children?.length ? (
                <ul className="mt-2 space-y-1.5">
                  {category.children.slice(0, 4).map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`${basePath}/c/${child.permalink}`}
                        className="text-sm text-marketplace-muted-foreground hover:text-marketplace-foreground"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
