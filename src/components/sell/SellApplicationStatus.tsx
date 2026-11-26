"use client";

import {
  ArrowRight,
  Check,
  Clock,
  Loader2,
  MessageSquareWarning,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { buildAccountLoginHref } from "@/lib/utils/account-redirect";
import styles from "./sell-application.module.css";
import { sellerJourneyState } from "./seller-journey";
import { useSellerApplication } from "./use-seller-application";

const KNOWN_STATUSES = [
  "draft",
  "submitted",
  "changes_requested",
  "approved",
  "rejected",
] as const;
type KnownStatus = (typeof KNOWN_STATUSES)[number];

const KNOWN_EVENTS = [
  "draft_saved",
  "submitted",
  "changes_requested",
  "approved",
  "rejected",
] as const;

const STATUS_ICONS: Record<KnownStatus, typeof Clock> = {
  draft: Clock,
  submitted: Clock,
  changes_requested: MessageSquareWarning,
  approved: ShieldCheck,
  rejected: XCircle,
};

interface SellApplicationStatusProps {
  basePath: string;
  applicationsEmail: string;
  sellerPanelUrl?: string;
}

export function SellApplicationStatus({
  basePath,
  applicationsEmail,
  sellerPanelUrl,
}: SellApplicationStatusProps) {
  const t = useTranslations("sell.status");
  const { isAuthenticated, user } = useAuth();
  const { application, loading } = useSellerApplication();
  const applyPath = `${basePath}/sell/apply`;

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        {t("loading")}
      </div>
    );
  }

  if (!application) {
    return (
      <section className={styles.statusCard}>
        <h2 className={styles.statusTitle}>{t("empty.title")}</h2>
        <p className={styles.stepHelp}>
          {isAuthenticated ? t("empty.bodySignedIn") : t("empty.body")}
        </p>
        <div className={styles.statusActions}>
          <Link href={applyPath} className={styles.primary}>
            {t("empty.start")}
          </Link>
          {!isAuthenticated ? (
            <Link
              href={buildAccountLoginHref(
                basePath,
                `${basePath}/sell/application`,
              )}
              className={styles.ghost}
            >
              {t("empty.signIn")}
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  const status: KnownStatus = (KNOWN_STATUSES as readonly string[]).includes(
    application.status,
  )
    ? (application.status as KnownStatus)
    : "submitted";
  const Icon = STATUS_ICONS[status];
  const formatDate = (value?: string | null) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;
  const journey = sellerJourneyState(
    application,
    !!user?.seller_dashboard_access,
  );
  const approved = status === "approved";
  const milestones = [
    { key: "submitted", done: status !== "draft" },
    {
      key: "review",
      done: ["changes_requested", "approved", "rejected"].includes(status),
    },
    { key: "decision", done: ["approved", "rejected"].includes(status) },
    ...(status === "rejected"
      ? []
      : [
          { key: "activate", done: approved && application.seller_access },
          { key: "open", done: approved && journey === "active" },
        ]),
  ] as const;
  const body =
    approved &&
    (journey === "activate" || journey === "setup" || journey === "active")
      ? t(`journey.${journey}`, { email: application.applicant_email ?? "" })
      : t(`body.${status}`);

  return (
    <div className="space-y-6">
      <section
        className={`${styles.statusCard} ${styles[`status_${status}`] ?? ""}`}
      >
        <div className={styles.statusBadge}>
          <Icon className="size-4" aria-hidden />
          {t(`labels.${status}`)}
        </div>
        <h2 className={styles.statusTitle}>
          {application.shop_name || t("untitled")}
        </h2>
        <p className={styles.stepHelp}>{body}</p>

        {application.decision_reason &&
        ["changes_requested", "rejected"].includes(status) ? (
          <div className={styles.notice}>
            <p className="font-semibold">{t("reasonTitle")}</p>
            <p className="mt-1 whitespace-pre-line">
              {application.decision_reason}
            </p>
          </div>
        ) : null}

        <dl className={styles.statusFacts}>
          <div>
            <dt>{t("facts.email")}</dt>
            <dd>{application.applicant_email}</dd>
          </div>
          {application.submitted_at ? (
            <div>
              <dt>{t("facts.submitted")}</dt>
              <dd>{formatDate(application.submitted_at)}</dd>
            </div>
          ) : null}
          {application.decided_at &&
          ["approved", "rejected"].includes(status) ? (
            <div>
              <dt>{t("facts.decided")}</dt>
              <dd>{formatDate(application.decided_at)}</dd>
            </div>
          ) : null}
        </dl>

        <div className={styles.statusActions}>
          {status === "draft" ? (
            <Link href={applyPath} className={styles.primary}>
              {t("actions.continue")}{" "}
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Link>
          ) : null}
          {status === "changes_requested" ? (
            <Link href={`${applyPath}?step=about`} className={styles.primary}>
              {t("actions.correct")}{" "}
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Link>
          ) : null}
          {approved &&
          sellerPanelUrl &&
          (journey === "setup" || journey === "active") ? (
            <a href={sellerPanelUrl} className={styles.primary}>
              {journey === "setup"
                ? t("actions.completeSetup")
                : t("actions.sellerPanel")}{" "}
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </a>
          ) : null}
          <a href={`mailto:${applicationsEmail}`} className={styles.ghost}>
            {t("actions.contact")}
          </a>
        </div>
      </section>

      {status !== "draft" ? (
        <section className={styles.statusCard}>
          <h3 className={styles.sectionTitle}>{t("progressTitle")}</h3>
          <ol className={styles.milestones}>
            {milestones.map((milestone) => (
              <li
                key={milestone.key}
                className={milestone.done ? styles.milestoneDone : ""}
              >
                <span className={styles.progressMark}>
                  {milestone.done ? (
                    <Check className="size-3.5" aria-hidden />
                  ) : null}
                </span>
                <span>
                  <strong>{t(`milestones.${milestone.key}.title`)}</strong>
                  <small>{t(`milestones.${milestone.key}.body`)}</small>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {application.events?.length ? (
        <section className={styles.statusCard}>
          <h3 className={styles.sectionTitle}>{t("historyTitle")}</h3>
          <ol className={styles.history}>
            {[...application.events].reverse().map((event) => (
              <li key={event.id}>
                <span className={styles.historyDate}>
                  {formatDate(event.created_at)}
                </span>
                <span>
                  {(KNOWN_EVENTS as readonly string[]).includes(event.action)
                    ? t(
                        `events.${event.action as (typeof KNOWN_EVENTS)[number]}`,
                      )
                    : t("events.updated")}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
