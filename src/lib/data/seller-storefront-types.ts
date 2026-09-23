import type { Policy, Seller } from "@spree/sdk";

export type SellerShopSection = {
  id: string;
  name: string;
  slug: string;
  position: number;
  active: boolean;
  products_count?: number;
};

export type SellerStorefrontPayload = {
  seller: Seller & {
    policies?: Policy[];
    rating_distribution?: Record<string, number> | null;
    tagline?: string | null;
    on_vacation?: boolean;
    sellable?: boolean;
    sales_count?: number;
  };
  sections: SellerShopSection[];
  featured_product_ids: string[];
  stats: {
    reviews_count: number;
    average_rating: number | null;
    followers_count: number;
    sales_count: number;
  };
  following: boolean | null;
  messaging_available: boolean | null;
};

export type SellerStorefrontTab =
  | "home"
  | "products"
  | "reviews"
  | "about"
  | "policies"
  | "custom-orders";
