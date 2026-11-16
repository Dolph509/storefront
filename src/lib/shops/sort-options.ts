/** Store API `sort` values verified via homepage `sellers.list` usage. */
export const SHOP_DIRECTORY_SORT_OPTIONS = [
  { value: "-average_rating", labelKey: "sortTopRated" as const },
  { value: "-followers_count", labelKey: "sortMostFollowed" as const },
  { value: "name", labelKey: "sortName" as const },
] as const;

export type ShopDirectorySort =
  (typeof SHOP_DIRECTORY_SORT_OPTIONS)[number]["value"];

export function parseShopDirectorySort(
  value: string | undefined,
): ShopDirectorySort {
  const allowed = new Set(
    SHOP_DIRECTORY_SORT_OPTIONS.map((option) => option.value),
  );
  if (value && allowed.has(value as ShopDirectorySort)) {
    return value as ShopDirectorySort;
  }
  return "-average_rating";
}
