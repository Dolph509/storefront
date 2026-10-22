"use server";

import { createHash } from "node:crypto";
import { getClient } from "@/lib/spree/config";

/**
 * Presigns and uploads milestone evidence through the collaboration portal API.
 * Runs on the server so Active Storage direct uploads avoid browser cross-origin PUT.
 */
export async function uploadCollaborationPortalDeliverable(
  portalToken: string,
  formData: FormData,
): Promise<string> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("missing_file");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("md5").update(buffer).digest("base64");
  const client = getClient();

  const presign = await client.request<{
    signed_id: string;
    direct_upload: { url: string; headers: Record<string, string> };
  }>("POST", "/collaboration_portal/direct_uploads", {
    headers: { "X-Spree-Collaboration-Token": portalToken },
    body: {
      blob: {
        filename: file.name,
        byte_size: file.size,
        checksum,
        content_type: file.type || "application/octet-stream",
      },
    },
  });

  const put = await fetch(presign.direct_upload.url, {
    method: "PUT",
    headers: presign.direct_upload.headers,
    body: buffer,
  });
  if (!put.ok) {
    throw new Error(`upload_failed_${put.status}`);
  }

  return presign.signed_id;
}
