"use server";

import type { CollaborationCredit } from "@spree/sdk";
import { getClient } from "@/lib/spree";
import { withFallback } from "./utils";

const empty = { data: [] as CollaborationCredit[] };

export async function getProductCollaborators(productIdOrSlug: string) {
  const client = getClient();
  return withFallback(
    async () =>
      client.request<{ data: CollaborationCredit[] }>(
        "GET",
        `/products/${productIdOrSlug}/collaborators`,
      ),
    empty,
  );
}
