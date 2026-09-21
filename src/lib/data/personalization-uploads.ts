"use server";

import { createHash } from "node:crypto";
import { getClient, withAuthRefresh } from "@/lib/spree";

/**
 * Customer direct-upload for personalization artwork.
 * Returns the ActiveStorage signed_id — never expose it in the UI.
 */
export async function uploadPersonalizationFile(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("missing_file");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("md5").update(buffer).digest("base64");

  return withAuthRefresh(async (options) => {
    const client = getClient();
    const upload = await client.customer.directUploads.create(
      {
        blob: {
          filename: file.name,
          byte_size: file.size,
          checksum,
          content_type: file.type || "application/octet-stream",
        },
      },
      options,
    );

    const put = await fetch(upload.direct_upload.url, {
      method: "PUT",
      headers: upload.direct_upload.headers,
      body: buffer,
    });
    if (!put.ok) {
      throw new Error(`upload_failed_${put.status}`);
    }

    return { signedId: upload.signed_id, filename: file.name };
  });
}
