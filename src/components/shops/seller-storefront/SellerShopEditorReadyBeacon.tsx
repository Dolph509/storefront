"use client";

import { useEffect } from "react";

/** Lets the seller panel push live preview patches once the iframe has mounted. */
export function SellerShopEditorReadyBeacon() {
  useEffect(() => {
    window.parent.postMessage(
      { source: "spree-shop-editor", action: "ready" },
      "*",
    );
  }, []);

  return null;
}
