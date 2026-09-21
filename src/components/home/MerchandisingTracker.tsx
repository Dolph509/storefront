"use client";

import { useEffect } from "react";
import {
  type MerchandisingAnalyticsPayload,
  trackMerchandisingEvent,
} from "@/lib/analytics/merchandising";

export function MerchandisingImpression({
  event,
  payload,
}: {
  event: string;
  payload: MerchandisingAnalyticsPayload;
}) {
  useEffect(() => {
    trackMerchandisingEvent(event, payload);
  }, [event, payload.campaign_id, payload.placement_id, payload.collection_id]);

  return null;
}
