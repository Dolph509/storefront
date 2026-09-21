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
    { data: [] as OrderProof[], meta: undefined },
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
