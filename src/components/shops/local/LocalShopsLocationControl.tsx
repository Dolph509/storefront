"use client";

import { LocateFixed, MapPin } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import type { VisitorLocationSource } from "@/lib/shops/visitor-location-shared";
import { cn } from "@/lib/utils";

interface LocalShopsLocationControlProps {
  locationLabel: string;
  source: VisitorLocationSource;
  usedFallback?: boolean;
  className?: string;
}

export function LocalShopsLocationControl({
  locationLabel,
  source,
  usedFallback = false,
  className,
}: LocalShopsLocationControlProps) {
  const t = useTranslations("shops");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(locationLabel);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pushNear(nextNear: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextNear.trim();
    if (trimmed) {
      params.set("near", trimmed);
    } else {
      params.delete("near");
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setEditing(false);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    pushNear(value);
  }

  async function detectLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError(t("locationUnsupported"));
      setEditing(true);
      return;
    }
    setDetecting(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 12_000,
            maximumAge: 10 * 60_000,
          });
        },
      );
      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      );
      if (!response.ok) throw new Error("reverse_geocode_failed");
      const payload = (await response.json()) as {
        city?: string;
        locality?: string;
        principalSubdivisionCode?: string;
        principalSubdivision?: string;
        countryName?: string;
      };
      const city = payload.city || payload.locality;
      const region =
        payload.principalSubdivisionCode?.replace(/^[A-Z]+-/, "") ||
        payload.principalSubdivision;
      const nextLabel = [city, region || payload.countryName]
        .filter(Boolean)
        .join(", ");
      if (!nextLabel) throw new Error("empty_location");
      setValue(nextLabel);
      pushNear(nextLabel);
    } catch {
      setError(t("locationDetectFailed"));
      setEditing(true);
    } finally {
      setDetecting(false);
    }
  }

  const sourceLabel =
    source === "profile"
      ? t("locationSourceProfile")
      : source === "network"
        ? t("locationSourceNetwork")
        : source === "manual"
          ? t("locationSourceManual")
          : t("locationSourceStorefront");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <p className="inline-flex min-w-0 items-center gap-1.5 text-sm text-marketplace-muted-foreground">
          <MapPin
            aria-hidden
            className="size-3.5 shrink-0 text-marketplace-brand"
          />
          <span className="min-w-0">
            {usedFallback
              ? t("showingBroaderNear", { location: locationLabel })
              : t("showingNear", { location: locationLabel })}
            <span className="text-marketplace-border"> · </span>
            <span>{sourceLabel}</span>
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setValue(locationLabel);
              setEditing((open) => !open);
              setError(null);
            }}
            className="text-sm font-medium text-marketplace-brand underline-offset-4 hover:underline"
          >
            {editing ? t("locationCancel") : t("locationChange")}
          </button>
          <button
            type="button"
            onClick={() => void detectLocation()}
            disabled={detecting}
            className="inline-flex items-center gap-1.5 rounded-full border border-marketplace-border bg-white px-3 py-1.5 text-xs font-semibold text-marketplace-foreground transition-colors hover:border-marketplace-brand hover:text-marketplace-brand disabled:opacity-60"
          >
            <LocateFixed aria-hidden className="size-3.5" />
            {detecting ? t("locationDetecting") : t("locationUseMine")}
          </button>
        </div>
      </div>

      {editing ? (
        <form
          onSubmit={onSubmit}
          className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center"
        >
          <label htmlFor="local-shops-near" className="sr-only">
            {t("locationInputLabel")}
          </label>
          <input
            id="local-shops-near"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={t("locationInputPlaceholder")}
            className="h-10 w-full rounded-full border border-marketplace-border bg-white px-4 text-sm outline-none focus:border-marketplace-brand focus:ring-2 focus:ring-marketplace-brand/15"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-full bg-marketplace-brand px-4 text-sm font-semibold text-marketplace-brand-foreground hover:bg-marketplace-brand-accent-hover"
          >
            {t("locationApply")}
          </button>
        </form>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
