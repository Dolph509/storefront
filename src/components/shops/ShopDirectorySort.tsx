"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { NativeSelect } from "@/components/ui/native-select";
import {
  SHOP_DIRECTORY_SORT_OPTIONS,
  type ShopDirectorySort as ShopDirectorySortValue,
} from "@/lib/shops/sort-options";

interface ShopDirectorySortProps {
  currentSort: ShopDirectorySortValue;
}

export function ShopDirectorySort({ currentSort }: ShopDirectorySortProps) {
  const t = useTranslations("shops");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <NativeSelect
      aria-label={t("sortLabel")}
      value={currentSort}
      onChange={(event) => {
        const value = event.target.value as ShopDirectorySortValue;
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="w-[200px]"
    >
      {SHOP_DIRECTORY_SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {t(option.labelKey)}
        </option>
      ))}
    </NativeSelect>
  );
}
