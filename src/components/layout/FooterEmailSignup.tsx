"use client";

import { type FormEvent, useId, useState } from "react";
import { subscribeToFooterNewsletter } from "@/lib/data/footer-newsletter";

export function FooterEmailSignup({
  title,
  description,
  buttonLabel,
  successText,
}: {
  title: string;
  description?: string;
  buttonLabel: string;
  successText: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const emailInputId = useId();

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
    <div data-theme-footer-block-type="footer_email_signup" className="min-w-0">
      <h2 className="text-sm font-semibold">{title}</h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-marketplace-muted-foreground">
          {description}
        </p>
      )}
      <form className="mt-3 flex flex-wrap gap-2" onSubmit={submit}>
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
          className="min-w-0 flex-1 rounded-md border border-marketplace-border bg-white px-3 py-2 text-sm text-gray-900"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-marketplace-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "sending" ? "Submitting…" : buttonLabel}
        </button>
      </form>
      {status === "success" && (
        <p role="status" className="mt-2 text-sm">
          {successText}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
