// Generated from assets/empty-states. Do not edit by hand.
export const emptyStateNames = [
  "all-caught-up",
  "empty-cart",
  "item-unavailable",
  "no-active-promotions",
  "no-conversations",
  "no-customers-yet",
  "no-favorites-yet",
  "no-followed-shops",
  "no-inventory-yet",
  "no-listings-yet",
  "no-messages-yet",
  "no-orders-yet",
  "no-policies-yet",
  "no-results-found",
  "no-reviews-yet",
  "no-sales-yet",
  "no-tracking-info",
  "no-upcoming-events",
  "nothing-here-yet",
  "nothing-saved",
  "nothing-to-configure",
  "order-history-empty",
  "page-not-found",
  "shop-closed",
  "shop-on-vacation",
  "no-addresses",
  "no-analytics",
  "no-coupons",
  "no-custom-orders",
  "no-drafts",
  "no-notifications",
  "no-payouts",
  "no-saved-searches",
  "payment-failed",
  "access-denied",
  "could-not-connect",
] as const;
export type EmptyStateName = (typeof emptyStateNames)[number];
type ArtworkNode = {
  tag: "path" | "circle" | "rect";
  props: Record<string, string>;
};
export const emptyStatePaths: Record<EmptyStateName, ArtworkNode[]> = {
  "all-caught-up": [
    {
      tag: "path",
      props: {
        d: "M21 43h22l-2 9H23l-2-9Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M32 43V27",
      },
    },
    {
      tag: "path",
      props: {
        d: "M32 33c-8 0-13-4-14-10 7 0 12 3 14 10Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M32 29c2-7 7-11 14-12-1 7-5 11-14 12Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M17 17l-3-3M48 13l3-3M51 28h4",
      },
    },
    {
      tag: "path",
      props: {
        d: "M26 52h12",
      },
    },
  ],
  "empty-cart": [
    {
      tag: "path",
      props: {
        d: "M12 18h5l4 22h23l5-16H20",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "26",
        cy: "47",
        r: "2.5",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "42",
        cy: "47",
        r: "2.5",
      },
    },
    {
      tag: "path",
      props: {
        d: "M31 16c0-4 2-6 5-6s5 2 5 5c0 4-5 5-5 8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M36 23h10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M36 23 29 27",
      },
    },
  ],
  "item-unavailable": [
    {
      tag: "path",
      props: {
        d: "M13 27 28 12h19l7 7-15 15-19 19-7-7V27Z",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "41",
        cy: "18",
        r: "2.5",
      },
    },
    {
      tag: "path",
      props: {
        d: "M20 42 42 20",
      },
    },
    {
      tag: "path",
      props: {
        d: "m22 22 20 20",
      },
    },
  ],
  "no-active-promotions": [
    {
      tag: "path",
      props: {
        d: "M12 22h40v20H12c3-4 3-8 0-12 3-4 3-6 0-8Z",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "27",
        cy: "29",
        r: "2.5",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "39",
        cy: "35",
        r: "2.5",
      },
    },
    {
      tag: "path",
      props: {
        d: "M25 38 41 24",
      },
    },
    {
      tag: "path",
      props: {
        d: "M48 18c3-3 6-4 9-3",
      },
    },
  ],
  "no-conversations": [
    {
      tag: "path",
      props: {
        d: "M13 18h30a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5H27l-8 7v-7h-6a5 5 0 0 1-5-5V23a5 5 0 0 1 5-5Z",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "21",
        cy: "31",
        r: "1.5",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "30",
        cy: "31",
        r: "1.5",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "39",
        cy: "31",
        r: "1.5",
      },
    },
    {
      tag: "path",
      props: {
        d: "M47 22c3-3 6-3 8 0 1 3-2 6-5 8",
      },
    },
  ],
  "no-customers-yet": [
    {
      tag: "circle",
      props: {
        cx: "24",
        cy: "28",
        r: "6",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "40",
        cy: "28",
        r: "6",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "32",
        cy: "19",
        r: "6",
      },
    },
    {
      tag: "path",
      props: {
        d: "M14 47c1-8 6-12 10-12 3 0 5 1 8 4 3-3 5-4 8-4 5 0 9 4 10 12",
      },
    },
    {
      tag: "path",
      props: {
        d: "M28 41c1-3 3-4 5-1 2-3 5-2 6 1 1 3-3 6-6 8-3-2-6-5-5-8Z",
      },
    },
  ],
  "no-favorites-yet": [
    {
      tag: "path",
      props: {
        d: "M16 29c0-7 8-11 16-3 8-8 16-4 16 3 0 10-16 20-16 20S16 39 16 29Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M12 22l-3-3M52 22l3-3M32 14v-5",
      },
    },
  ],
  "no-followed-shops": [
    {
      tag: "path",
      props: {
        d: "M14 24h36",
      },
    },
    {
      tag: "path",
      props: {
        d: "M18 24 14 32h36l-4-8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M17 32v19h30V32",
      },
    },
    {
      tag: "path",
      props: {
        d: "M23 51V40h8v11",
      },
    },
    {
      tag: "path",
      props: {
        d: "M36 40c1-3 4-4 6-1 2-3 5-2 6 1 1 3-3 6-6 8-3-2-7-5-6-8Z",
      },
    },
  ],
  "no-inventory-yet": [
    {
      tag: "path",
      props: {
        d: "M12 33h16v16H12zM36 33h16v16H36zM24 17h16v16H24z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M44 21c0-6 4-10 9-11-1 6-4 10-9 11Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M44 21c-4-4-8-4-11-1 2 4 6 5 11 4",
      },
    },
  ],
  "no-listings-yet": [
    {
      tag: "rect",
      props: {
        x: "16",
        y: "12",
        width: "32",
        height: "40",
        rx: "3",
      },
    },
    {
      tag: "path",
      props: {
        d: "M22 22h20M22 29h20M22 36h14",
      },
    },
    {
      tag: "path",
      props: {
        d: "M24 12v-3M40 12v-3",
      },
    },
    {
      tag: "path",
      props: {
        d: "M44 44c3-6 7-9 12-9-1 7-5 11-12 12",
      },
    },
    {
      tag: "path",
      props: {
        d: "M44 44c-2-4-5-6-8-6",
      },
    },
  ],
  "no-messages-yet": [
    {
      tag: "rect",
      props: {
        x: "13",
        y: "18",
        width: "38",
        height: "28",
        rx: "4",
      },
    },
    {
      tag: "path",
      props: {
        d: "m14 22 18 14 18-14",
      },
    },
    {
      tag: "path",
      props: {
        d: "M28 26c1-3 4-4 6-1 2-3 5-2 6 1 1 3-3 6-6 8-3-2-7-5-6-8Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M20 14l3-4M44 14l-3-4",
      },
    },
  ],
  "no-orders-yet": [
    {
      tag: "path",
      props: {
        d: "M14 24 32 17l18 7-18 7-18-7Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M14 24v19l18 7 18-7V24",
      },
    },
    {
      tag: "path",
      props: {
        d: "M32 31v19",
      },
    },
    {
      tag: "path",
      props: {
        d: "M14 24 9 19l18-6 5 4",
      },
    },
    {
      tag: "path",
      props: {
        d: "M50 24l5-5-18-6-5 4",
      },
    },
    {
      tag: "path",
      props: {
        d: "M27 36c2-3 8-3 10 0 2 4-5 8-5 8s-7-4-5-8Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M25 11c2-3 5-3 7 0 2-3 5-3 7 0 1 3-3 6-7 9-4-3-8-6-7-9Z",
      },
    },
  ],
  "no-policies-yet": [
    {
      tag: "path",
      props: {
        d: "M16 12h27l5 5v35H16V12Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M43 12v7h7",
      },
    },
    {
      tag: "path",
      props: {
        d: "M22 24h18M22 30h18M22 36h12",
      },
    },
    {
      tag: "path",
      props: {
        d: "M41 39l8 3v6c0 4-3 7-8 9-5-2-8-5-8-9v-6l8-3Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "m37 48 3 3 6-7",
      },
    },
  ],
  "no-results-found": [
    {
      tag: "circle",
      props: {
        cx: "29",
        cy: "29",
        r: "15",
      },
    },
    {
      tag: "path",
      props: {
        d: "m40 40 11 11",
      },
    },
    {
      tag: "path",
      props: {
        d: "M24 32c2-7 7-11 13-12-1 7-5 12-13 12Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M24 32c5-1 9-4 13-12",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 16l-3-3M45 16l3-3",
      },
    },
  ],
  "no-reviews-yet": [
    {
      tag: "path",
      props: {
        d: "m32 13 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2 5-10Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M13 46h8M43 46h8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M15 16l-3-3M49 16l3-3",
      },
    },
  ],
  "no-sales-yet": [
    {
      tag: "path",
      props: {
        d: "M12 50h40",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 44V34h8v10M28 44V28h8v16M40 44V20h8v24",
      },
    },
    {
      tag: "path",
      props: {
        d: "M14 28c8-3 14-8 20-14 5 4 10 6 16 5",
      },
    },
    {
      tag: "path",
      props: {
        d: "m46 15 5 4-5 4",
      },
    },
  ],
  "no-tracking-info": [
    {
      tag: "path",
      props: {
        d: "M18 24 32 18l14 6-14 6-14-6Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M18 24v18l14 6 14-6V24",
      },
    },
    {
      tag: "path",
      props: {
        d: "M32 30v18",
      },
    },
    {
      tag: "path",
      props: {
        d: "M10 31h6M8 37h8M10 43h6",
      },
    },
    {
      tag: "path",
      props: {
        d: "M48 29c4 1 7 3 9 6",
      },
    },
  ],
  "no-upcoming-events": [
    {
      tag: "rect",
      props: {
        x: "13",
        y: "16",
        width: "38",
        height: "34",
        rx: "4",
      },
    },
    {
      tag: "path",
      props: {
        d: "M13 25h38M21 12v8M43 12v8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M22 33h8M22 40h8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M38 34c1-3 4-4 6-1 2-3 5-2 6 1 1 3-3 6-6 8-3-2-7-5-6-8Z",
      },
    },
  ],
  "nothing-here-yet": [
    {
      tag: "path",
      props: {
        d: "M10 40c8-15 17-17 24-8 6 8 12 3 10-3",
      },
    },
    {
      tag: "path",
      props: {
        d: "M10 40c6 2 9 1 12-2",
      },
    },
    {
      tag: "path",
      props: {
        d: "M38 20c2-6 8-8 12-4-1 5-4 8-9 9",
      },
    },
    {
      tag: "path",
      props: {
        d: "M38 20c-4-5-10-4-12 1 2 5 6 7 11 6",
      },
    },
    {
      tag: "path",
      props: {
        d: "M38 20c0 6 2 10 6 14",
      },
    },
    {
      tag: "path",
      props: {
        d: "M18 46c2 2 4 2 6 0",
      },
    },
  ],
  "nothing-saved": [
    {
      tag: "path",
      props: {
        d: "M14 24 32 17l18 7-18 7-18-7Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M14 24v19l18 7 18-7V24",
      },
    },
    {
      tag: "path",
      props: {
        d: "M32 31v19",
      },
    },
    {
      tag: "path",
      props: {
        d: "M26 12c2-3 5-3 7 0 2-3 5-3 7 0 1 3-3 6-7 9-4-3-8-6-7-9Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M20 18l-3-3M44 18l3-3",
      },
    },
  ],
  "nothing-to-configure": [
    {
      tag: "circle",
      props: {
        cx: "31",
        cy: "32",
        r: "8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M31 16v5M31 43v5M15 32h5M42 32h5M20 21l4 4M38 39l4 4M42 21l-4 4M24 39l-4 4",
      },
    },
    {
      tag: "path",
      props: {
        d: "M45 45c3-7 7-10 12-11-1 7-5 11-12 11Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M45 45c-3-4-6-5-9-4",
      },
    },
  ],
  "order-history-empty": [
    {
      tag: "path",
      props: {
        d: "M17 12h27l5 5v35H17V12Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M44 12v7h7",
      },
    },
    {
      tag: "path",
      props: {
        d: "M23 25h18M23 31h18M23 37h12",
      },
    },
    {
      tag: "path",
      props: {
        d: "M26 46c2-3 5-3 7 0 2-3 5-3 7 0 1 3-3 6-7 8-4-2-8-5-7-8Z",
      },
    },
  ],
  "page-not-found": [
    {
      tag: "path",
      props: {
        d: "M10 18h30l10 8v20H10V18Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M40 18v8h10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 35h8M22 30v10",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "32",
        cy: "35",
        r: "5",
      },
    },
    {
      tag: "path",
      props: {
        d: "M40 35h8M46 30v10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M18 47c4 3 8 3 12 0M34 47c4 3 8 3 12 0",
      },
    },
  ],
  "shop-closed": [
    {
      tag: "path",
      props: {
        d: "M17 20h30",
      },
    },
    {
      tag: "path",
      props: {
        d: "M22 20 17 28h30l-5-8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M20 28v23h24V28",
      },
    },
    {
      tag: "path",
      props: {
        d: "M27 51V39h10v12",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 14h32",
      },
    },
    {
      tag: "path",
      props: {
        d: "M28 10h8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M14 38h36",
      },
    },
  ],
  "shop-on-vacation": [
    {
      tag: "path",
      props: {
        d: "M15 42c2-10 9-15 19-15 8 0 13 4 15 11 2 6-3 12-11 12H24c-7 0-11-3-9-8Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M23 29c-1-4 0-7 4-9 3 4 6 5 11 5",
      },
    },
    {
      tag: "path",
      props: {
        d: "M40 30c4 0 7 2 9 6",
      },
    },
    {
      tag: "path",
      props: {
        d: "M29 39h1M39 39h1",
      },
    },
    {
      tag: "path",
      props: {
        d: "M33 44c2 1 4 1 6 0",
      },
    },
    {
      tag: "path",
      props: {
        d: "M46 17h5l-5 5h5",
      },
    },
    {
      tag: "path",
      props: {
        d: "M52 10h4l-4 4h4",
      },
    },
  ],
  "no-addresses": [
    {
      tag: "path",
      props: {
        d: "M34 52V30l30-18 30 18v22",
      },
    },
    {
      tag: "path",
      props: {
        d: "M42 52V34h44v18",
      },
    },
    {
      tag: "path",
      props: {
        d: "M54 52V40h12v12",
      },
    },
    {
      tag: "path",
      props: {
        d: "M74 42h6M74 48h8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M26 78c0-12 8-18 16-18 10 0 17 7 17 16 0 13-14 23-17 25-3-2-16-12-16-23Z",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "42",
        cy: "78",
        r: "5",
      },
    },
    {
      tag: "path",
      props: {
        d: "M66 72h26",
        strokeDasharray: "1 10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M82 72c8-8 16-10 26-8",
        strokeDasharray: "6 8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M24 99c13-3 24-3 34 0M70 99c12-3 24-3 34 0",
        opacity: ".55",
      },
    },
  ],
  "no-analytics": [
    {
      tag: "path",
      props: {
        d: "M22 96h80",
      },
    },
    {
      tag: "rect",
      props: {
        x: "32",
        y: "66",
        width: "10",
        height: "30",
        rx: "2",
      },
    },
    {
      tag: "rect",
      props: {
        x: "50",
        y: "54",
        width: "10",
        height: "42",
        rx: "2",
      },
    },
    {
      tag: "rect",
      props: {
        x: "68",
        y: "40",
        width: "10",
        height: "56",
        rx: "2",
      },
    },
    {
      tag: "path",
      props: {
        d: "M28 34c14 0 24 4 34 12 7-12 17-18 34-22",
        strokeDasharray: "6 8",
      },
    },
    {
      tag: "path",
      props: {
        d: "m92 20 4 10-10 2",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 36h14v22H16z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M20 36v-6M26 36v-6",
      },
    },
    {
      tag: "path",
      props: {
        d: "M20 46h2M24 46h2M20 54h2M24 54h2",
      },
    },
    {
      tag: "path",
      props: {
        d: "M92 76c8 0 13 4 17 12-8 0-14-3-17-12Z",
      },
    },
  ],
  "no-coupons": [
    {
      tag: "path",
      props: {
        d: "M26 74h56v20H26c4-3 6-6 6-10s-2-7-6-10Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M44 74v20",
        strokeDasharray: "6 8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M54 81h12M60 75v12",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "38",
        cy: "84",
        r: "3",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "68",
        cy: "84",
        r: "3",
      },
    },
    {
      tag: "path",
      props: {
        d: "M24 50l10-10 10 10v18H24Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M32 40v-8M28 36h8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M87 44l8-8 8 8-8 8Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M91 44h8M95 40v8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M95 76c8 0 13 4 17 12-8 0-14-3-17-12Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M94 76c-1 7 1 12 6 16",
      },
    },
  ],
  "no-custom-orders": [
    {
      tag: "rect",
      props: {
        x: "34",
        y: "18",
        width: "60",
        height: "84",
        rx: "6",
      },
    },
    {
      tag: "path",
      props: {
        d: "M48 18v-8h32v8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M59 10c3-4 10-4 13 0 3-4 10-4 13 0",
      },
    },
    {
      tag: "path",
      props: {
        d: "M52 42c3-4 10-4 13 0 3-4 10-4 13 0",
      },
    },
    {
      tag: "path",
      props: {
        d: "M55 60h18",
        strokeDasharray: "1 8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M51 56c8 5 12 11 13 18 6-6 12-10 21-12",
        strokeDasharray: "6 8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M20 35h16v28H20z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M24 35v-8M32 35v-8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M27 50h2M27 58h2",
      },
    },
    {
      tag: "path",
      props: {
        d: "M95 34c8-1 14 2 18 10-8 1-14-2-18-10Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M94 35c-2 8 0 14 7 18",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 98c12-8 28-9 40-2M72 96c13-6 25-5 40 2",
        opacity: ".55",
      },
    },
  ],
  "no-drafts": [
    {
      tag: "path",
      props: {
        d: "M28 20h48l10 10v54H28V20Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M76 20v10h10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M41 43c5-6 13-7 23 0",
        strokeDasharray: "6 8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M43 61h28M43 69h18",
      },
    },
    {
      tag: "path",
      props: {
        d: "M18 80l7-26 20 20-27 6Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "m18 80 9-9",
      },
    },
    {
      tag: "path",
      props: {
        d: "M91 68c8 0 13 4 17 12-8 0-14-3-17-12Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M90 68c-1 7 1 12 6 16",
      },
    },
    {
      tag: "path",
      props: {
        d: "M44 31c2-3 7-3 9 0 2-3 7-3 9 0 1 4-4 7-9 10-5-3-10-6-9-10Z",
      },
    },
  ],
  "no-notifications": [
    {
      tag: "path",
      props: {
        d: "M64 26c12 0 20 9 20 21v13l8 10H36l8-10V47c0-12 8-21 20-21Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M58 23c0-3 3-6 6-6s6 3 6 6",
      },
    },
    {
      tag: "path",
      props: {
        d: "M57 78c1 6 4 10 7 10s6-4 7-10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M26 41h12M18 52h10M98 41h-12M110 52h-10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M64 44c3-4 10-4 13 0 3-4 10-4 13 0 1 4-5 8-13 13-8-5-14-9-13-13Z",
        transform: "translate(-16,-2) scale(.78) translate(20,18)",
      },
    },
    {
      tag: "path",
      props: {
        d: "M94 84l12-10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M102 74l8 8-8 8",
      },
    },
  ],
  "no-payouts": [
    {
      tag: "rect",
      props: {
        x: "34",
        y: "34",
        width: "54",
        height: "34",
        rx: "8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M34 46h54",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "50",
        cy: "55",
        r: "4",
      },
    },
    {
      tag: "path",
      props: {
        d: "M61 55h12",
      },
    },
    {
      tag: "path",
      props: {
        d: "M26 87c0-10 6-16 12-16 7 0 11 6 11 13 0 9-9 16-11 17-2-1-12-8-12-14Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M86 86c7 0 13 3 18 10-8 1-14-2-18-10Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M85 87c-2 7 0 12 6 16",
      },
    },
    {
      tag: "path",
      props: {
        d: "M53 24c3-4 10-4 13 0 3-4 10-4 13 0 1 4-5 8-13 13-8-5-14-9-13-13Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M58 18v10M64 16v10M70 18v10",
        opacity: ".6",
      },
    },
  ],
  "no-saved-searches": [
    {
      tag: "circle",
      props: {
        cx: "56",
        cy: "50",
        r: "26",
      },
    },
    {
      tag: "path",
      props: {
        d: "m74 68 20 20",
      },
    },
    {
      tag: "path",
      props: {
        d: "M46 53c4-11 12-17 23-18-2 12-9 18-23 18Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M46 53c8-1 14-6 23-18",
      },
    },
    {
      tag: "path",
      props: {
        d: "M28 78c6-6 16-6 22 0",
        strokeDasharray: "6 8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 74l10-7 10 7v20l-10 8-10-8Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M22 83c2-3 7-3 9 0 2-3 7-3 9 0 1 4-4 7-9 10-5-3-10-6-9-10Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M87 28c7-1 13 2 17 10-7 1-13-2-17-10Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M86 30c-2 7 0 12 6 16",
      },
    },
  ],
  "payment-failed": [
    {
      tag: "rect",
      props: {
        x: "28",
        y: "40",
        width: "68",
        height: "42",
        rx: "9",
      },
    },
    {
      tag: "path",
      props: {
        d: "M28 54h68",
      },
    },
    {
      tag: "path",
      props: {
        d: "M40 67h11M58 67h10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M74 28c3-4 9-4 12 0 3-4 9-4 12 0 2 5-4 10-12 15-8-5-14-10-12-15Z",
        opacity: ".9",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 87c0-14 10-21 20-21 12 0 20 8 20 19 0 14-15 25-20 29-4-3-20-14-20-27Z",
        opacity: ".75",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "96",
        cy: "34",
        r: "13",
      },
    },
    {
      tag: "path",
      props: {
        d: "M91 29l10 10M101 29 91 39",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 102c15-5 29-5 44 0M70 102c14-5 28-5 42 0",
        opacity: ".45",
      },
    },
  ],
  "access-denied": [
    {
      tag: "path",
      props: {
        d: "M42 50V34c0-13 9-22 22-22s22 9 22 22v16",
      },
    },
    {
      tag: "rect",
      props: {
        x: "28",
        y: "48",
        width: "72",
        height: "54",
        rx: "10",
      },
    },
    {
      tag: "path",
      props: {
        d: "M52 74c0-7 5-12 12-12s12 5 12 12c0 5-3 9-7 11v9h-10v-9c-4-2-7-6-7-11Z",
      },
    },
    {
      tag: "circle",
      props: {
        cx: "64",
        cy: "74",
        r: "11",
        opacity: ".55",
      },
    },
    {
      tag: "path",
      props: {
        d: "M57 74h14",
      },
    },
    {
      tag: "path",
      props: {
        d: "M18 91c8-1 14 2 18 10-8 1-14-2-18-10Z",
        opacity: ".7",
      },
    },
    {
      tag: "path",
      props: {
        d: "M92 92c8-1 14 2 18 10-8 1-14-2-18-10Z",
        opacity: ".7",
      },
    },
    {
      tag: "path",
      props: {
        d: "M17 52l6-6M105 52l6-6M18 60h8M102 60h8",
        opacity: ".75",
      },
    },
  ],
  "could-not-connect": [
    {
      tag: "path",
      props: {
        d: "M28 70c-12 0-20-8-20-19 0-10 8-18 18-18 2-14 14-24 30-24 15 0 28 9 31 23 11 0 21 8 21 19 0 12-9 21-22 21Z",
      },
    },
    {
      tag: "path",
      props: {
        d: "M79 78l-6 6-9-9",
        opacity: ".15",
      },
    },
    {
      tag: "path",
      props: {
        d: "M34 82c5-8 12-12 20-12 7 0 12 3 17 9",
        strokeDasharray: "7 8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M25 98l13-13",
      },
    },
    {
      tag: "path",
      props: {
        d: "M25 85l13 13",
      },
    },
    {
      tag: "path",
      props: {
        d: "M77 99c11-1 19-9 20-20",
      },
    },
    {
      tag: "path",
      props: {
        d: "M89 72l8 7 9-8",
      },
    },
    {
      tag: "path",
      props: {
        d: "M16 103c13-4 28-4 42 0M72 103c12-4 25-4 40 0",
        opacity: ".45",
      },
    },
    {
      tag: "path",
      props: {
        d: "M93 23l6-6M103 33l6-6",
        opacity: ".7",
      },
    },
  ],
};
