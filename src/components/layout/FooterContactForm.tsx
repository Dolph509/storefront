"use client";

import { type FormEvent, useId, useState } from "react";

export function buildFooterContactMailtoHref(
  recipientEmail: string,
  subject: string,
  body: string,
): string | null {
  const address = recipientEmail.trim();
  const parts = address.split("@");
  if (
    address.length > 254 ||
    /[\s\r\n]/.test(address) ||
    parts.length !== 2 ||
    !parts[0] ||
    !parts[1]?.includes(".") ||
    parts[1].startsWith(".") ||
    parts[1].endsWith(".")
  ) {
    return null;
  }

  const encodedAddress = encodeURIComponent(address).replace("%40", "@");
  return `mailto:${encodedAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function FooterContactForm({
  title,
  description,
  recipientEmail,
  submitLabel,
}: {
  title: string;
  description?: string;
  recipientEmail: string;
  submitLabel: string;
}) {
  const [error, setError] = useState("");
  const formId = useId();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const subject = String(values.get("subject") ?? "Website message");
    const body = [
      `Name: ${String(values.get("name") ?? "")}`,
      `Email: ${String(values.get("email") ?? "")}`,
      "",
      String(values.get("message") ?? ""),
    ].join("\n");
    const href = buildFooterContactMailtoHref(recipientEmail, subject, body);
    if (!href) {
      setError("Add a valid contact email in this block’s settings first.");
      return;
    }
    window.location.href = href;
  }

  return (
    <div data-theme-footer-block-type="footer_contact_form" className="min-w-0">
      <h2 className="text-sm font-semibold">{title}</h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-marketplace-muted-foreground">
          {description}
        </p>
      )}
      <form className="mt-3 space-y-2" onSubmit={submit}>
        <label className="sr-only" htmlFor={`${formId}-name`}>
          Name
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          autoComplete="name"
          required
          placeholder="Name"
          className="w-full rounded-md border border-marketplace-border bg-white px-3 py-2 text-sm text-gray-900"
        />
        <label className="sr-only" htmlFor={`${formId}-email`}>
          Email
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email"
          className="w-full rounded-md border border-marketplace-border bg-white px-3 py-2 text-sm text-gray-900"
        />
        <label className="sr-only" htmlFor={`${formId}-subject`}>
          Subject
        </label>
        <input
          id={`${formId}-subject`}
          name="subject"
          placeholder="Subject"
          className="w-full rounded-md border border-marketplace-border bg-white px-3 py-2 text-sm text-gray-900"
        />
        <label className="sr-only" htmlFor={`${formId}-message`}>
          Message
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          placeholder="Message"
          rows={4}
          className="w-full rounded-md border border-marketplace-border bg-white px-3 py-2 text-sm text-gray-900"
        />
        <button
          type="submit"
          className="rounded-md bg-marketplace-brand px-3 py-2 text-sm font-medium text-white"
        >
          {submitLabel}
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
