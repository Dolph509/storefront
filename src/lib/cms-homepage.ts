export function cmsHomepageEnabled(): boolean {
  return process.env.CMS_HOMEPAGE_ENABLED === "1";
}
