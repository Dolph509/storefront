import "@spree/sdk";

declare module "@spree/sdk" {
  interface LineItem {
    proof_required: boolean;
    personalization_snapshot: Array<Record<string, unknown>> | null;
    personalization_fingerprint: string | null;
    personalization_files: Array<{
      id: string;
      url: string;
      filename: string;
      content_type: string;
    }>;
  }

  interface Product {
    proof_required: boolean;
    custom_order_seller_note: string | null;
    custom_order_processing_weeks_min: number | null;
    custom_order_processing_weeks_max: number | null;
    personalization_fields?: ProductPersonalizationField[];
  }

  interface ProductPersonalizationField {
    id: string;
    name: string;
    key: string;
    field_type:
      | "short_text"
      | "long_text"
      | "dropdown"
      | "radio"
      | "checkbox"
      | "multi_select"
      | "swatch"
      | "file"
      | "boolean"
      | "info";
    position: number;
    required: boolean;
    instructions: string | null;
    placeholder: string | null;
    min_length: number | null;
    max_length: number | null;
    visible_when_equals: string | null;
    configuration: Record<string, unknown> | null;
    price_adjustment: string;
    visible_when_field_id: string | null;
    choices: ProductPersonalizationChoice[];
  }

  interface ProductPersonalizationChoice {
    id: string;
    name: string;
    key: string;
    position: number;
    swatch_value: string | null;
    price_adjustment: string;
  }
}
