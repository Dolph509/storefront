"use server";

import type { OrderProof } from "@spree/sdk";
import { getClient, withAuthRefresh } from "@/lib/spree";
import { withFallback } from "./utils";

export async function listOrderProofs(orderId: string) {
  return withFallback(
    async () => {
      return withAuthRefresh(async (options) => {
        return getClient().orders.proofs.list(orderId, undefined, options);
      });
    },
    { data: [] as OrderProof[], meta: { page: 1, limit: 25, count: 0, pages: 0, from: 0, to: 0, in: 0, previous: null, next: null } },
  );
}

export async function approveOrderProof(orderId: string, proofId: string) {
  return withAuthRefresh(async (options) => {
    return getClient().orders.proofs.approve(orderId, proofId, options);
  });
}

export async function requestOrderProofChanges(
  orderId: string,
  proofId: string,
  buyerResponse: string,
) {
  return withAuthRefresh(async (options) => {
    return getClient().orders.proofs.requestChanges(
      orderId,
      proofId,
      { buyer_response: buyerResponse },
      options,
    );
  });
}
