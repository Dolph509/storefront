"use server";

import type { DataRequest } from "@spree/sdk";
import {
  clearAuthCookies,
  getClient,
  isAuthError,
  withAuthRefresh,
} from "@/lib/spree";
import { actionResult } from "./utils";

export async function createDataRequest(params: {
  kind: "access" | "erasure";
  current_password?: string;
}) {
  return actionResult(async () => {
    let request: DataRequest;
    try {
      request = await withAuthRefresh(async (options) => {
        return getClient().customer.dataRequests.create(params, options);
      });
    } catch (error) {
      if (isAuthError(error)) {
        await clearAuthCookies();
      }
      throw error;
    }
    return { request };
  }, "Failed to create data request");
}
