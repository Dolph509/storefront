"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadCollaborationPortalDeliverable } from "@/lib/data/collaboration-portal-deliverable-upload";
import { getClient } from "@/lib/spree/config";

type PortalHeaders = { "X-Spree-Collaboration-Token": string };

type Participant = {
  id: string;
  display_name: string;
  role: string;
  status: string;
};

type Collaboration = {
  id: string;
  title: string;
  status: string;
  kind: string;
  my_role?: string | null;
  my_participant_id?: string | null;
  participants?: Participant[];
};

type Agreement = {
  id: string;
  version: number;
  status: string;
  rendered_body: string;
  content_hash: string;
  missing_signatory_ids?: string[];
};

type Deliverable = {
  id: string;
  file_name?: string | null;
  file_url?: string | null;
  note?: string | null;
};

type Milestone = {
  id: string;
  title: string;
  status: string;
  due_on?: string | null;
  acceptance_criteria?: string;
  responsible_participant_id?: string;
  deliverables?: Deliverable[];
};

type Message = {
  id: string;
  body: string;
  author_name?: string;
  created_at?: string;
};

type DisputeDecision = {
  id: string;
  outcome: string;
  reason: string;
  remedy?: string | null;
};

type Dispute = {
  id: string;
  reason: string;
  status: string;
  description: string;
  decisions?: DisputeDecision[];
};

const DISPUTE_REASONS = [
  "work_not_delivered",
  "missed_deadline",
  "poor_quality",
  "agreement_violation",
  "compensation",
  "other",
] as const;

function portalHeaders(token: string): PortalHeaders {
  return { "X-Spree-Collaboration-Token": token };
}

export function CollaborationPortalWorkspace() {
  const t = useTranslations("collaborate");
  const routeParams = useParams<{ id: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [collaboration, setCollaboration] = useState<Collaboration | null>(
    null,
  );
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [milestoneNotes, setMilestoneNotes] = useState<Record<string, string>>(
    {},
  );
  const [milestoneFiles, setMilestoneFiles] = useState<
    Record<string, File | null>
  >({});
  const [disputeReason, setDisputeReason] =
    useState<(typeof DISPUTE_REASONS)[number]>("work_not_delivered");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const client = useMemo(() => getClient(), []);

  const load = useCallback(
    async (sessionToken: string) => {
      const headers = portalHeaders(sessionToken);
      const [
        project,
        agreementPayload,
        milestonePayload,
        messagePayload,
        disputePayload,
      ] = await Promise.all([
        client.request<Collaboration>(
          "GET",
          "/collaboration_portal/collaboration",
          { headers },
        ),
        client.request<{ data: Agreement[] }>(
          "GET",
          "/collaboration_portal/agreements",
          { headers },
        ),
        client.request<{ data: Milestone[] }>(
          "GET",
          "/collaboration_portal/milestones",
          { headers },
        ),
        client.request<{ data: Message[] }>(
          "GET",
          "/collaboration_portal/messages",
          { headers },
        ),
        client.request<{ data: Dispute[] }>(
          "GET",
          "/collaboration_portal/disputes",
          { headers },
        ),
      ]);
      setCollaboration(project);
      setAgreements(agreementPayload.data ?? []);
      setMilestones(milestonePayload.data ?? []);
      setMessages(messagePayload.data ?? []);
      setDisputes(disputePayload.data ?? []);
    },
    [client],
  );

  useEffect(() => {
    const sessionToken = window.sessionStorage.getItem(
      "spree_collaboration_portal_token",
    );
    if (!sessionToken) {
      setError(true);
      return;
    }
    setToken(sessionToken);
    load(sessionToken).catch(() => setError(true));
  }, [load]);

  useEffect(() => {
    const routeId = routeParams?.id;
    if (!routeId || !collaboration) return;
    if (collaboration.id !== routeId) {
      setError(true);
    }
  }, [collaboration, routeParams?.id]);

  async function run(action: () => Promise<void>, successKey: string) {
    if (!token) return;
    setPending(true);
    setNotice(null);
    try {
      await action();
      await load(token);
      setNotice(t(successKey));
    } catch {
      setNotice(t("actionFailed"));
    } finally {
      setPending(false);
    }
  }

  async function downloadDeliverable(deliverableId: string, filename: string) {
    if (!token) return;
    const publishableKey =
      process.env.NEXT_PUBLIC_SPREE_PUBLISHABLE_KEY?.trim() ||
      process.env.SPREE_PUBLISHABLE_KEY?.trim() ||
      "";
    const response = await fetch(
      `/api/v3/store/collaboration_portal/deliverables/${deliverableId}/download`,
      {
        headers: {
          "X-Spree-Api-Key": publishableKey,
          "X-Spree-Collaboration-Token": token,
        },
      },
    );
    if (!response.ok) return;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[#595959]">
        {t("sessionExpired")}
      </div>
    );
  }

  if (!collaboration) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-[#595959]">
        {t("loading")}
      </div>
    );
  }

  const myId = collaboration.my_participant_id;
  const pendingAgreement = agreements.find(
    (agreement) => agreement.status === "awaiting_signatures",
  );
  const canAccept =
    pendingAgreement &&
    myId &&
    (pendingAgreement.missing_signatory_ids ?? []).includes(myId);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8178]">
          {collaboration.kind.replaceAll("_", " ")}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#222]">
          {collaboration.title}
        </h1>
        <p className="mt-3 text-sm text-[#595959]">{t("workspaceLead")}</p>
        <p className="mt-2 text-sm text-[#222]">
          {t("statusLine", {
            status: collaboration.status.replaceAll("_", " "),
            role: (collaboration.my_role ?? "").replaceAll("_", " "),
          })}
        </p>
      </header>

      {notice ? (
        <p
          className="rounded-xl border border-[#e8e4df] bg-white px-4 py-3 text-sm text-[#222]"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      <section className="rounded-2xl border border-[#e8e4df] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#222]">
          {t("participants")}
        </h2>
        <ul className="mt-4 space-y-2">
          {(collaboration.participants ?? []).map((participant) => (
            <li
              key={participant.id}
              className="flex justify-between gap-4 text-sm"
            >
              <span className="font-medium text-[#222]">
                {participant.display_name}
              </span>
              <span className="text-[#595959]">
                {participant.role.replaceAll("_", " ")} · {participant.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#e8e4df] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#222]">{t("agreement")}</h2>
        {pendingAgreement ? (
          <>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-[#f7f5f2] p-4 text-sm text-[#222]">
              {pendingAgreement.rendered_body}
            </pre>
            {canAccept ? (
              <Button
                className="mt-4"
                disabled={pending}
                onClick={() =>
                  void run(
                    () =>
                      client
                        .request(
                          "POST",
                          `/collaboration_portal/agreements/${pendingAgreement.id}/acceptance`,
                          {
                            headers: portalHeaders(token!),
                            body: {
                              content_hash: pendingAgreement.content_hash,
                            },
                          },
                        )
                        .then(() => undefined),
                    "acceptedAgreement",
                  )
                }
              >
                {t("acceptAgreement")}
              </Button>
            ) : (
              <p className="mt-4 text-sm text-[#595959]">
                {t("waitingForOthers")}
              </p>
            )}
          </>
        ) : agreements.length > 0 ? (
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-[#f7f5f2] p-4 text-sm text-[#222]">
            {agreements[agreements.length - 1]?.rendered_body}
          </pre>
        ) : (
          <p className="mt-3 text-sm text-[#595959]">{t("noAgreement")}</p>
        )}
      </section>

      <section className="rounded-2xl border border-[#e8e4df] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#222]">{t("milestones")}</h2>
        {milestones.length === 0 ? (
          <p className="mt-3 text-sm text-[#595959]">{t("noMilestones")}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {milestones.map((milestone) => {
              const mine = milestone.responsible_participant_id === myId;
              const submittable =
                mine &&
                ["not_started", "in_progress", "changes_requested"].includes(
                  milestone.status,
                );
              return (
                <li
                  key={milestone.id}
                  className="rounded-xl border border-[#efeae3] p-4"
                >
                  <p className="font-medium text-[#222]">{milestone.title}</p>
                  <p className="mt-1 text-sm text-[#595959]">
                    {milestone.status.replaceAll("_", " ")}
                    {milestone.due_on ? ` · ${milestone.due_on}` : ""}
                  </p>
                  {milestone.acceptance_criteria ? (
                    <p className="mt-2 text-sm text-[#595959]">
                      {milestone.acceptance_criteria}
                    </p>
                  ) : null}
                  {(milestone.deliverables ?? []).length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm text-[#595959]">
                      {(milestone.deliverables ?? []).map((deliverable) => (
                        <li key={deliverable.id}>
                          {deliverable.file_name ? (
                            <button
                              type="button"
                              className="text-[#222] underline"
                              onClick={() =>
                                void downloadDeliverable(
                                  deliverable.id,
                                  deliverable.file_name ?? "file",
                                )
                              }
                            >
                              {deliverable.file_name}
                            </button>
                          ) : (
                            deliverable.note
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {submittable ? (
                    <div className="mt-3 flex flex-col gap-2">
                      <textarea
                        value={milestoneNotes[milestone.id] ?? ""}
                        onChange={(event) =>
                          setMilestoneNotes((current) => ({
                            ...current,
                            [milestone.id]: event.target.value,
                          }))
                        }
                        className="min-h-20 rounded-xl border border-[#d8d3cc] px-3 py-2 text-sm"
                        placeholder={t("evidenceNote")}
                      />
                      <label className="text-sm text-[#595959]">
                        {t("evidenceFile")}
                        <input
                          id={`milestone-file-${milestone.id}`}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,application/pdf"
                          className="mt-1 block w-full text-sm"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            setMilestoneFiles((current) => ({
                              ...current,
                              [milestone.id]: file,
                            }));
                          }}
                        />
                      </label>
                      <Button
                        disabled={pending}
                        onClick={() =>
                          void run(async () => {
                            const file =
                              milestoneFiles[milestone.id] ??
                              (
                                document.getElementById(
                                  `milestone-file-${milestone.id}`,
                                ) as HTMLInputElement | null
                              )?.files?.[0] ??
                              null;
                            let signedId: string | undefined;
                            if (file && token) {
                              const formData = new FormData();
                              formData.set("file", file);
                              signedId =
                                await uploadCollaborationPortalDeliverable(
                                  token,
                                  formData,
                                );
                            }
                            await client.request(
                              "POST",
                              `/collaboration_portal/milestones/${milestone.id}/submissions`,
                              {
                                headers: portalHeaders(token!),
                                body: {
                                  note: milestoneNotes[milestone.id],
                                  ...(signedId ? { file: signedId } : {}),
                                },
                              },
                            );
                            setMilestoneFiles((current) => ({
                              ...current,
                              [milestone.id]: null,
                            }));
                          }, "submittedMilestone")
                        }
                      >
                        {t("submitWork")}
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[#e8e4df] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#222]">{t("messages")}</h2>
        <ul className="mt-4 space-y-3">
          {messages.map((message) => (
            <li key={message.id} className="text-sm">
              <p className="font-medium text-[#222]">{message.author_name}</p>
              <p className="text-[#595959]">{message.body}</p>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              await client.request("POST", "/collaboration_portal/messages", {
                headers: portalHeaders(token!),
                body: { body: messageBody },
              });
              setMessageBody("");
            }, "sentMessage");
          }}
        >
          <textarea
            required
            value={messageBody}
            onChange={(event) => setMessageBody(event.target.value)}
            className="min-h-20 rounded-xl border border-[#d8d3cc] px-3 py-2 text-sm"
            placeholder={t("messagePlaceholder")}
          />
          <Button type="submit" disabled={pending}>
            {t("sendMessage")}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#e8e4df] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#222]">{t("disputes")}</h2>
        {disputes.length === 0 ? (
          <p className="mt-3 text-sm text-[#595959]">{t("noDisputes")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {disputes.map((dispute) => (
              <li key={dispute.id} className="text-sm">
                <p className="font-medium text-[#222]">
                  {dispute.reason.replaceAll("_", " ")} ·{" "}
                  {dispute.status.replaceAll("_", " ")}
                </p>
                <p className="text-[#595959]">{dispute.description}</p>
                {(dispute.decisions ?? []).map((decision) => (
                  <div
                    key={decision.id}
                    className="mt-2 rounded-lg bg-[#f7f5f2] p-3"
                  >
                    <p className="font-medium text-[#222]">
                      {decision.outcome.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[#595959]">
                      {decision.reason}
                    </p>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              await client.request("POST", "/collaboration_portal/disputes", {
                headers: portalHeaders(token!),
                body: {
                  reason: disputeReason,
                  description: disputeDescription,
                },
              });
              setDisputeDescription("");
            }, "openedDispute");
          }}
        >
          <label className="text-sm font-medium text-[#222]">
            {t("disputeReason")}
            <select
              className="mt-1 h-11 w-full rounded-xl border border-[#d8d3cc] px-3 font-normal"
              value={disputeReason}
              onChange={(event) =>
                setDisputeReason(
                  event.target.value as (typeof DISPUTE_REASONS)[number],
                )
              }
            >
              {DISPUTE_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {t(`reasons.${reason}`)}
                </option>
              ))}
            </select>
          </label>
          <textarea
            required
            value={disputeDescription}
            onChange={(event) => setDisputeDescription(event.target.value)}
            className="min-h-20 rounded-xl border border-[#d8d3cc] px-3 py-2 text-sm"
            placeholder={t("disputePlaceholder")}
          />
          <Button type="submit" disabled={pending} variant="outline">
            {t("openDispute")}
          </Button>
        </form>
      </section>
    </div>
  );
}
