"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getClient } from "@/lib/spree/config";

export function CollaborateInviteForm({
  token,
  previewTitle,
}: {
  token: string;
  previewTitle: string;
}) {
  const t = useTranslations("collaborate");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [declined, setDeclined] = useState(false);

  async function submit(accept: boolean) {
    setPending(true);
    setError(null);
    try {
      const session = await getClient().request<{
        token?: string | null;
        collaboration_id: string;
      }>("POST", "/collaboration_portal/sessions", {
        body: { token, email, accept },
      });
      if (!accept || !session.token) {
        setDeclined(true);
        setPending(false);
        return;
      }
      window.sessionStorage.setItem(
        "spree_collaboration_portal_token",
        session.token,
      );
      router.push(`./projects/${session.collaboration_id}`);
    } catch {
      setError(t("invalidEmail"));
      setPending(false);
    }
  }

  return (
    <form
      className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl border border-[#e8e4df] bg-white p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(true);
      }}
    >
      <h1 className="text-xl font-semibold text-[#222]">{t("title")}</h1>
      <p className="text-sm text-[#595959]">
        {declined ? t("declined") : t("lead", { title: previewTitle })}
      </p>
      {declined ? null : (
        <>
          <label className="flex flex-col gap-1 text-sm font-medium text-[#222]">
            {t("emailLabel")}
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-xl border border-[#d8d3cc] px-3 font-normal"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-3">
            <Button type="submit" disabled={pending} className="flex-1">
              {t("accept")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => void submit(false)}
              className="flex-1"
            >
              {t("decline")}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
