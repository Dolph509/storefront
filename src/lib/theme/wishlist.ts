export function isConfiguredWishlistPage(
  settings: Record<string, unknown> | undefined,
  pageSlug: string,
): boolean {
  if (!settings) return false;
  const enabled = settings.enable_wishlist;
  return enabled !== false && enabled !== "false" && settings.wishlist_page_slug === pageSlug;
}
