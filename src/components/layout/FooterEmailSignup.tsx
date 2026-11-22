"use client";

import { type FormEvent, useId, useState } from "react";
import { subscribeToFooterNewsletter } from "@/lib/data/footer-newsletter";
import { cn } from "@/lib/utils";

export function FooterEmailSignup({
  title,
  description,
  buttonLabel,
  successText,
  variant = "default",
}: {
  title: string;
  description?: string;
  buttonLabel: string;
  successText: string;
  variant?: "default" | "pill" | "band";
}) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const emailInputId = useId();
  const isPill = variant === "pill";
  const isBand = variant === "band";
  const usePillForm = isPill || isBand;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    try {
      await subscribeToFooterNewsletter(email);
      setStatus("success");
      form.reset();
    } catch (reason) {
      setStatus("error");
      setError(
        reason instanceof Error
          ? reason.message
          : "We couldn’t sign you up. Please try again.",
      );
    }
  }

  return (
    <div
      data-theme-footer-block-type="footer_email_signup"
      className={cn(
        "min-w-0",
        isPill && "text-center",
        isBand &&
          "grid items-center gap-6 text-left lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.35fr)] lg:gap-10",
      )}
    >
      <h2
        className={cn(
          usePillForm
            ? "font-display text-[1.65rem] font-normal leading-tight tracking-[-0.02em] text-marketplace-foreground lg:text-[1.85rem]"
            : "text-sm font-semibold",
          isBand && "lg:mb-0",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-sm leading-6 text-marketplace-muted-foreground",
            isPill ? "mx-auto mt-3 max-w-[34ch]" : null,
            isBand
              ? "mt-0 max-w-[42ch] lg:justify-self-center lg:text-center"
              : null,
            !usePillForm && "mt-2",
          )}
        >
          {description}
        </p>
      ) : null}
      <div className={cn(isBand && "min-w-0")}>
        <form
          className={cn(
            usePillForm
              ? "flex items-center gap-2 rounded-full border border-marketplace-border bg-marketplace-surface p-1.5 ps-4"
              : "mt-2.5 flex flex-wrap gap-2",
            isPill && "mx-auto mt-5 max-w-md",
            isBand && "mt-0 w-full max-w-lg lg:max-w-none lg:justify-self-end",
          )}
          onSubmit={submit}
        >
          <label className="sr-only" htmlFor={emailInputId}>
            Email address
          </label>
          <input
            id={emailInputId}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            disabled={status === "sending"}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-sm text-marketplace-foreground placeholder:text-marketplace-muted-foreground focus-visible:outline-none",
              usePillForm
                ? "min-h-10 border-0 px-0 py-2"
                : "min-h-10 rounded-[var(--marketplace-radius-sm)] border border-marketplace-border bg-marketplace-surface px-3 py-2 focus-visible:border-marketplace-brand",
            )}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className={cn(
              "shrink-0 font-medium transition-colors disabled:opacity-60",
              usePillForm
                ? "min-h-10 rounded-full border border-marketplace-foreground bg-marketplace-surface px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-marketplace-foreground hover:bg-marketplace-foreground hover:text-marketplace-surface"
                : "min-h-10 rounded-[var(--marketplace-button-radius)] bg-marketplace-brand px-4 py-2 text-sm text-marketplace-brand-foreground hover:bg-marketplace-brand-accent",
            )}
          >
            {status === "sending" ? "Submitting…" : buttonLabel}
          </button>
        </form>
        {status === "success" ? (
          <p role="status" className="mt-2 text-sm">
            {successText}
          </p>
        ) : null}
        {status === "error" ? (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
