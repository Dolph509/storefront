"use server";

import { getClient, withAuthRefresh } from "@/lib/spree";
import { withFallback } from "./utils";

export async function getSellerAbuseReportReasons() {
  return withFallback(
    async () => {
      const client = getClient();
      return client.abuseReports.reasons("seller");
    },
    { data: [] },
  );
}

export async function reportSellerShop(params: {
  sellerId: string;
  body: string;
  reasonId?: string;
  reporterEmail?: string;
}) {
  const payload = {
    subject_type: "seller" as const,
    subject_id: params.sellerId,
    body: params.body,
    reason_id: params.reasonId,
    reporter_email: params.reporterEmail,
  };

  return withAuthRefresh(async (options) => {
    return getClient().abuseReports.create(payload, options);
  });
}
