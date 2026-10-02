import { afterEach, describe, expect, it, vi } from "vitest";
import {
  themeTemplateHomeEnabled,
  themeTemplateProductEnabled,
  themeTemplateCollectionEnabled,
  themeTemplateCategoryEnabled,
  themeTemplatePageEnabled,
  themeTemplateSellerEnabled,
  themeSectionGroupsEnabled,
} from "./flags";

describe("homepage theme template cutover flag", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the published theme homepage by default", () => {
    vi.stubEnv("THEME_TEMPLATE_HOME_ENABLED", "");
    vi.stubEnv("CMS_HOMEPAGE_ENABLED", "");
    expect(themeTemplateHomeEnabled()).toBe(true);
  });

  it("enables the theme homepage when either opt-in flag is true", () => {
    vi.stubEnv("THEME_TEMPLATE_HOME_ENABLED", "1");
    vi.stubEnv("CMS_HOMEPAGE_ENABLED", "");
    expect(themeTemplateHomeEnabled()).toBe(true);

    vi.stubEnv("THEME_TEMPLATE_HOME_ENABLED", "");
    vi.stubEnv("CMS_HOMEPAGE_ENABLED", "true");
    expect(themeTemplateHomeEnabled()).toBe(true);
  });

  it("honors an explicit opt-out if either flag disables the cutover", () => {
    vi.stubEnv("THEME_TEMPLATE_HOME_ENABLED", "1");
    vi.stubEnv("CMS_HOMEPAGE_ENABLED", "false");
    expect(themeTemplateHomeEnabled()).toBe(false);
  });
});

describe("theme section group cutover flag", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses published header and footer groups by default", () => {
    vi.stubEnv("THEME_SECTION_GROUPS_ENABLED", "");
    expect(themeSectionGroupsEnabled()).toBe(true);
  });

  it("allows an explicit rollback to the existing header and footer", () => {
    vi.stubEnv("THEME_SECTION_GROUPS_ENABLED", "false");
    expect(themeSectionGroupsEnabled()).toBe(false);
  });
});

describe("resource theme template cutover flags", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses non-empty resource templates by default", () => {
    vi.stubEnv("THEME_TEMPLATE_PAGE_ENABLED", "");
    vi.stubEnv("THEME_TEMPLATE_SELLER_ENABLED", "");
    vi.stubEnv("THEME_TEMPLATE_PRODUCT_ENABLED", "");
    vi.stubEnv("THEME_TEMPLATE_COLLECTION_ENABLED", "");
    vi.stubEnv("THEME_TEMPLATE_CATEGORY_ENABLED", "");
    expect(themeTemplatePageEnabled()).toBe(true);
    expect(themeTemplateSellerEnabled()).toBe(true);
    expect(themeTemplateProductEnabled()).toBe(true);
    expect(themeTemplateCollectionEnabled()).toBe(true);
    expect(themeTemplateCategoryEnabled()).toBe(true);
  });

  it("allows each resource template to opt out explicitly", () => {
    vi.stubEnv("THEME_TEMPLATE_PAGE_ENABLED", "false");
    vi.stubEnv("THEME_TEMPLATE_SELLER_ENABLED", "0");
    vi.stubEnv("THEME_TEMPLATE_PRODUCT_ENABLED", "false");
    vi.stubEnv("THEME_TEMPLATE_COLLECTION_ENABLED", "0");
    vi.stubEnv("THEME_TEMPLATE_CATEGORY_ENABLED", "false");
    expect(themeTemplateSellerEnabled()).toBe(false);
    expect(themeTemplateProductEnabled()).toBe(false);
    expect(themeTemplateCollectionEnabled()).toBe(false);
    expect(themeTemplateCategoryEnabled()).toBe(false);
    expect(themeTemplatePageEnabled()).toBe(false);
  });
});
