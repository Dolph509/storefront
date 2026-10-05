import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SettingsStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function SettingsAlert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-[var(--marketplace-radius-sm)] border border-marketplace-danger/25 bg-marketplace-danger/5 px-3.5 py-2.5 text-sm text-marketplace-danger"
    >
      {children}
    </p>
  );
}

export function SettingsBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-tight",
        tone === "neutral" &&
          "bg-marketplace-surface-warm text-marketplace-muted-foreground",
        tone === "brand" && "bg-sky-100 text-sky-800",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "danger" && "bg-red-100 text-red-700",
      )}
    >
      {children}
    </span>
  );
}

export function SettingsEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--marketplace-radius-sm)] border border-dashed border-marketplace-border-subtle bg-marketplace-surface-warm/40 px-4 py-8 text-center text-sm text-marketplace-muted-foreground">
      {children}
    </div>
  );
}

export function SettingsList({ children }: { children: ReactNode }) {
  return (
    <ul className="divide-y divide-marketplace-border-subtle overflow-hidden rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface">
      {children}
    </ul>
  );
}

export function SettingsListItem({
  title,
  description,
  icon,
  badge,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--marketplace-radius-sm)] bg-marketplace-surface-warm text-marketplace-brand">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-marketplace-foreground">
              {title}
            </p>
            {badge}
          </div>
          {description ? (
            <p className="text-sm text-marketplace-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </li>
  );
}

export function SettingsChoice({
  id,
  checked,
  onChange,
  title,
  description,
  variant = "card",
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  variant?: "card" | "plain";
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3",
        variant === "card" &&
          "rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface-warm/30 px-4 py-3.5 transition-colors hover:bg-marketplace-surface-warm/55",
        variant === "plain" && "py-2",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 accent-marketplace-foreground"
      />
      <span className="min-w-0 text-sm">
        <span className="block font-semibold text-marketplace-foreground">
          {title}
        </span>
        {description ? (
          <span className="mt-1 block text-marketplace-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function SettingsSection({
  title,
  description,
  children,
  className,
  footer,
  tone = "default",
  badge,
  action,
  variant = "banded",
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  footer?: ReactNode;
  tone?: "default" | "danger";
  badge?: ReactNode;
  action?: ReactNode;
  variant?: "banded" | "flat";
}) {
  const heading = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            className={cn(
              "text-base font-semibold tracking-tight sm:text-lg",
              tone === "default" && "text-marketplace-foreground",
              tone === "danger" && "text-marketplace-danger",
            )}
          >
            {title}
          </h2>
          {badge}
        </div>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-marketplace-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--marketplace-radius-md)] border bg-marketplace-surface",
        tone === "default" && "border-marketplace-border-subtle",
        tone === "danger" && "border-marketplace-danger/25",
        className,
      )}
    >
      {variant === "banded" ? (
        <>
          <div
            className={cn(
              "border-b px-5 py-4 sm:px-6",
              tone === "default" &&
                "border-marketplace-border-subtle bg-marketplace-surface-warm/45",
              tone === "danger" &&
                "border-marketplace-danger/15 bg-marketplace-danger/[0.04]",
            )}
          >
            {heading}
          </div>
          {children ? (
            <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
              {children}
            </div>
          ) : null}
          {footer ? (
            <div
              className={cn(
                "border-t px-5 py-4 sm:px-6",
                tone === "default" &&
                  "border-marketplace-border-subtle bg-marketplace-surface-warm/20",
                tone === "danger" &&
                  "border-marketplace-danger/15 bg-marketplace-danger/[0.03]",
              )}
            >
              {footer}
            </div>
          ) : null}
        </>
      ) : (
        <div className="space-y-4 px-5 py-5 sm:space-y-5 sm:px-6 sm:py-6">
          {heading}
          {children}
          {footer}
        </div>
      )}
    </section>
  );
}
