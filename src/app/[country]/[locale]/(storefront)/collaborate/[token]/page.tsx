import { notFound } from "next/navigation";
import { getClient } from "@/lib/spree";
import { CollaborateInviteForm } from "./CollaborateInviteForm";

export default async function CollaborateInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let preview: { title: string };
  try {
    preview = await getClient().request<{ title: string }>(
      "GET",
      `/collaboration_invitations/${token}`,
    );
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <CollaborateInviteForm token={token} previewTitle={preview.title} />
    </div>
  );
}
