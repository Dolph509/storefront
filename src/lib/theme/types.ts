import type {
  CmsTheme,
  Product,
  ThemeTemplateDocument,
  ThemeTemplatePayload,
} from "@spree/sdk";

export type ThemeRenderContext =
  | HomeThemeContext
  | ProductThemeContext
  | CategoryThemeContext
  | CollectionThemeContext
  | SellerThemeContext
  | PageThemeContext;

export type BaseThemeContext = {
  basePath: string;
  locale: string;
  country: string;
  currency?: string;
};

export type HomeThemeContext = BaseThemeContext & { kind: "home" };

export type ProductThemeContext = BaseThemeContext & {
  kind: "product";
  product: Product;
  reviewSort?: "newest" | "highest" | "lowest";
  categoryId?: string;
};

export type CategoryThemeContext = BaseThemeContext & {
  kind: "category";
  categoryId: string;
};

export type CollectionThemeContext = BaseThemeContext & {
  kind: "collection";
  collectionId: string;
};

export type SellerThemeContext = BaseThemeContext & {
  kind: "seller";
  sellerSlug: string;
};

export type PageThemeContext = BaseThemeContext & {
  kind: "page";
  pageId: string;
  pageSlug: string;
};

export type ThemeRuntimeState = {
  theme: CmsTheme;
  template: ThemeTemplatePayload;
};

export type ThemeSectionInstance = {
  section_id: string;
  section_type: string;
  settings: Record<string, unknown>;
  blocks: Record<string, ThemeBlockInstance>;
  block_order: string[];
  disabled?: boolean;
};

export type ThemeBlockInstance = {
  type: string;
  disabled?: boolean;
  settings: Record<string, unknown>;
};

export type { ThemeTemplateDocument };
