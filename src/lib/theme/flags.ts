export function themeTemplateHomeEnabled(): boolean {
  return (
    process.env.THEME_TEMPLATE_HOME_ENABLED === "1" ||
    process.env.CMS_HOMEPAGE_ENABLED === "1"
  );
}

export function themeTemplateProductEnabled(): boolean {
  return process.env.THEME_TEMPLATE_PRODUCT_ENABLED === "1";
}

export function themeTemplateSellerEnabled(): boolean {
  return process.env.THEME_TEMPLATE_SELLER_ENABLED === "1";
}

export function themeTemplateCollectionEnabled(): boolean {
  return process.env.THEME_TEMPLATE_COLLECTION_ENABLED === "1";
}

export function themeTemplateCategoryEnabled(): boolean {
  return process.env.THEME_TEMPLATE_CATEGORY_ENABLED === "1";
}

export function themeTemplatePageEnabled(): boolean {
  return process.env.THEME_TEMPLATE_PAGE_ENABLED === "1";
}

export function themeSectionGroupsEnabled(): boolean {
  return process.env.THEME_SECTION_GROUPS_ENABLED === "1";
}
