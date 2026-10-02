import type {
  CmsTheme,
  Collection,
  Product,
  StoreMerchandisingPlacement,
  ThemeTemplateDocument,
  ThemeTemplatePayload,
} from "@spree/sdk";
import type { CmsPage } from "@/components/cms/types";
import type { SellerStorefrontPayload } from "@/lib/data/seller-storefront-types";
import type { CartDiscoveryInput } from "@/lib/discovery-context";

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

export type HomeThemeContext = BaseThemeContext & {
  kind: "home";
  placements?: StoreMerchandisingPlacement[];
};

export type ProductThemeContext = BaseThemeContext & {
  kind: "product";
  product: Product;
  reviewSort?: "newest" | "highest" | "lowest";
  categoryId?: string;
  sellerShopDiscovery?: CartDiscoveryInput;
};

export type CategoryThemeContext = BaseThemeContext & {
  kind: "category";
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
};

export type CollectionThemeContext = BaseThemeContext & {
  kind: "collection";
  collectionId: string;
  collectionName?: string;
  collectionSlug?: string;
  collection?: Collection;
};

export type SellerThemeContext = BaseThemeContext & {
  kind: "seller";
  sellerSlug: string;
  seller: SellerStorefrontPayload;
};

export type PageThemeContext = BaseThemeContext & {
  kind: "page";
  pageId: string;
  pageSlug: string;
  pageName?: string;
  page: CmsPage;
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
  parent_id?: string;
  settings: Record<string, unknown>;
};

export type { ThemeTemplateDocument };
