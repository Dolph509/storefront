import { sendGTMEvent } from "@next/third-parties/google";

export type MerchandisingAnalyticsPayload = {
  campaign_id?: string | null;
  placement_id?: string | null;
  collection_id?: string | null;
  seller_id?: string | null;
};

export function trackMerchandisingEvent(
  event: string,
  payload: MerchandisingAnalyticsPayload = {},
): void {
  sendGTMEvent({
    event,
    merchandising: payload,
  });
}
