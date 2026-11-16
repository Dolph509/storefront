/** Matches GET /api/v3/store/storefront_personalization/home `data` payload. */
export type HomeSectionCompositionFill = {
  type?: string;
  hero_variant?: string;
  product_ids?: string[];
  seller_ids?: string[];
  reason_codes?: string[];
};

export type HomePersonalizationComposition = {
  section_order: string[];
  sections: Record<string, HomeSectionCompositionFill>;
  composition_version: string;
  expires_at: string | null;
  interest_version: string | null;
};

export type PersonalizationInterestSummary = {
  personalization_enabled: boolean;
  top_category_ids: string[];
  behavioral_advertising_enabled: boolean;
  top_category_count: number;
  followed_shop_count: number;
  favorite_product_count: number;
  feedback_count: number;
  interest_version: string;
};
