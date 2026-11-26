"use server";

import { SpreeError } from "@spree/sdk";
import { getAuthOptions, getClient, withAuthRefresh } from "@/lib/spree";

export type SellerApplicationPhoto = {
  id: string;
  filename: string;
  content_type: string;
  byte_size: number;
};

export type SellerApplicationEvent = {
  id: string;
  action: string;
  from_status: string | null;
  to_status: string;
  created_at: string;
};

export type SellerApplicationRecord = {
  id: string;
  status: string;
  shop_name: string | null;
  craft_type: string | null;
  seller_type: string | null;
  years_experience: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  instagram: string | null;
  identity_name: string | null;
  applicant_email: string | null;
  access_token?: string | null;
  shop_description: string | null;
  supporting_information: string | null;
  product_description: string | null;
  production_notes: string | null;
  maker_story: string | null;
  materials: string | null;
  price_range: string | null;
  made_by: string | null;
  fulfillment_time: string | null;
  ships_to: string | null;
  wholesale_interest: string | null;
  categories: string[];
  decision_reason: string | null;
  agreements_accepted_at: string | null;
  submitted_at?: string | null;
  decided_at?: string | null;
  sample_photos: SellerApplicationPhoto[];
  events?: SellerApplicationEvent[];
  seller_id: string | null;
  seller_status: string | null;
  seller_access: boolean;
};

export type ApplicationPayload = {
  email?: string;
  shop_name?: string;
  craft_type?: string;
  seller_type?: string;
  years_experience?: number;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  instagram?: string;
  identity_name?: string;
  shop_description?: string;
  supporting_information?: string;
  product_description?: string;
  production_notes?: string;
  maker_story?: string;
  materials?: string;
  price_range?: string;
  made_by?: string;
  fulfillment_time?: string;
  ships_to?: string;
  wholesale_interest?: string;
  categories?: string[];
  agreements_accepted?: boolean;
};

export type SellerApplicationMutationResult =
  | { ok: true; data: SellerApplicationRecord }
  | {
      ok: false;
      message: string;
      status?: number;
      code?: string;
      fieldErrors: Record<string, string>;
    };

function tokenHeaders(accessToken?: string | null) {
  if (!accessToken) return {};
  return {
    headers: {
      "X-Spree-Seller-Application-Token": accessToken,
    },
  };
}

function firstDetailMessage(value: unknown): string | undefined {
  if (!Array.isArray(value)) return undefined;
  const first = value[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first) {
    return String((first as { message: string }).message);
  }
  return undefined;
}

function mapMutationError(error: unknown): SellerApplicationMutationResult {
  if (error instanceof SpreeError) {
    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(error.details ?? {})) {
      const message = firstDetailMessage(messages);
      if (message) fieldErrors[field] = message;
    }
    return {
      ok: false,
      message: error.message,
      status: error.status,
      code: error.code,
      fieldErrors,
    };
  }

  return {
    ok: false,
    message: error instanceof Error ? error.message : "Request failed",
    fieldErrors: {},
  };
}

/** Reads an application with its access token, or through the signed-in customer who owns it. */
export async function getSellerApplication(
  id: string,
  accessToken?: string | null,
): Promise<SellerApplicationRecord> {
  const authOptions = await getAuthOptions();
  return getClient().request<SellerApplicationRecord>(
    "GET",
    `/seller_applications/${id}`,
    { ...authOptions, ...tokenHeaders(accessToken) },
  );
}

/** Check seller access independently of the application history (including invited sellers). */
export async function hasSellerDashboardAccess(): Promise<boolean> {
  const options = await getAuthOptions();
  if (!options.token) return false;
  const customer = await getClient().customer.get(options);
  return (
    "seller_dashboard_access" in customer &&
    customer.seller_dashboard_access === true
  );
}

function sellerAlreadyRegistered(): SellerApplicationMutationResult {
  return {
    ok: false,
    status: 409,
    code: "seller_exists",
    message: "This account already has seller access.",
    fieldErrors: {},
  };
}

/** Applications linked to the signed-in customer; empty for guests. */
export async function listSellerApplications(): Promise<
  SellerApplicationRecord[]
> {
  try {
    const response = await withAuthRefresh((options) =>
      getClient().request<{ data: SellerApplicationRecord[] }>(
        "GET",
        "/seller_applications",
        options,
      ),
    );
    return response.data ?? [];
  } catch (error) {
    if (error instanceof SpreeError && error.status === 401) return [];
    throw error;
  }
}

export async function createSellerApplication(
  body: ApplicationPayload & { email: string },
): Promise<SellerApplicationMutationResult> {
  try {
    if (await hasSellerDashboardAccess()) return sellerAlreadyRegistered();
    const authOptions = await getAuthOptions();
    if ((await listSellerApplications()).length) {
      return {
        ok: false,
        status: 409,
        code: "application_exists",
        message: "You already have a seller application.",
        fieldErrors: { email: "Already applied" },
      };
    }
    const data = await getClient().request<SellerApplicationRecord>(
      "POST",
      "/seller_applications",
      { ...authOptions, body },
    );
    return { ok: true, data };
  } catch (error) {
    return mapMutationError(error);
  }
}

export async function updateSellerApplication(
  id: string,
  body: ApplicationPayload,
  accessToken: string,
): Promise<SellerApplicationMutationResult> {
  try {
    const data = await getClient().request<SellerApplicationRecord>(
      "PATCH",
      `/seller_applications/${id}`,
      { ...tokenHeaders(accessToken), body },
    );
    return { ok: true, data };
  } catch (error) {
    return mapMutationError(error);
  }
}

/** Submission requires a signed-in customer; guests get a 401 result. */
export async function submitSellerApplication(
  id: string,
  accessToken: string,
): Promise<SellerApplicationMutationResult> {
  try {
    if (await hasSellerDashboardAccess()) return sellerAlreadyRegistered();
    if (
      (await listSellerApplications()).some((existing) => existing.id !== id)
    ) {
      return {
        ok: false,
        status: 409,
        code: "application_exists",
        message: "You already have a seller application.",
        fieldErrors: { email: "Already applied" },
      };
    }
    const data = await withAuthRefresh((options) =>
      getClient().request<SellerApplicationRecord>(
        "POST",
        `/seller_applications/${id}/submit`,
        { ...options, ...tokenHeaders(accessToken) },
      ),
    );
    return { ok: true, data };
  } catch (error) {
    return mapMutationError(error);
  }
}

export async function checkSellerShopNameAvailability(
  shopName: string,
  applicationId?: string | null,
): Promise<{ available: boolean }> {
  const params: Record<string, string> = { shop_name: shopName };
  if (applicationId) params.application_id = applicationId;

  return getClient()
    .request<{ available: boolean; shop_name: string | null }>(
      "GET",
      "/seller_applications/shop_name_availability",
      { params },
    )
    .then((response) => ({ available: Boolean(response.available) }));
}

export async function uploadSellerApplicationPhoto(
  id: string,
  formData: FormData,
  accessToken: string,
): Promise<SellerApplicationMutationResult> {
  try {
    const data = await getClient().request<SellerApplicationRecord>(
      "POST",
      `/seller_applications/${id}/photos`,
      { ...tokenHeaders(accessToken), body: formData },
    );
    return { ok: true, data };
  } catch (error) {
    return mapMutationError(error);
  }
}

export async function deleteSellerApplicationPhoto(
  id: string,
  attachmentId: string,
  accessToken: string,
): Promise<SellerApplicationMutationResult> {
  try {
    const data = await getClient().request<SellerApplicationRecord>(
      "DELETE",
      `/seller_applications/${id}/photos/${attachmentId}`,
      tokenHeaders(accessToken),
    );
    return { ok: true, data };
  } catch (error) {
    return mapMutationError(error);
  }
}
