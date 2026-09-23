"use client";

import { useEffect, useRef } from "react";
import { recordStoreTrafficEvents } from "@/lib/data/traffic";
import {
  getOrCreateTrafficSessionToken,
  getOrCreateTrafficVisitorToken,
} from "@/lib/traffic/tokens";

interface SellerShopTrafficBeaconProps {
  sellerId: string;
  path: string;
}

/**
 * Records one shop_viewed event per browser session per seller (Phase E traffic).
 */
export function SellerShopTrafficBeacon({
  sellerId,
  path,
}: SellerShopTrafficBeaconProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !sellerId) return;
    const storageKey = `spree_shop_viewed:${sellerId}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {
      // sessionStorage unavailable — still attempt one send this mount
    }

    sent.current = true;
    void recordStoreTrafficEvents({
      session_token: getOrCreateTrafficSessionToken(),
      visitor_token: getOrCreateTrafficVisitorToken(),
      seller_id: sellerId,
      events: [
        {
          name: "shop_viewed",
          seller_id: sellerId,
          path,
          occurred_at: new Date().toISOString(),
        },
      ],
    })
      .then((result) => {
        if (!result.success) {
          sent.current = false;
          return;
        }
        try {
          sessionStorage.setItem(storageKey, "1");
        } catch {
          // ignore
        }
      })
      .catch(() => {
        sent.current = false;
      });
  }, [sellerId, path]);

  return null;
}
