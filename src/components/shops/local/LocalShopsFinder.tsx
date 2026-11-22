"use client";

import { ChevronDown, MapPin, Navigation } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import {
  LOCAL_RADIUS_OPTIONS,
  type LocalRadiusMiles,
} from "@/lib/shops/local-marketplace";
import { formatCityStateLabel } from "@/lib/shops/location-label";
import { resolveLocationQuery } from "@/lib/shops/resolve-location-query";
import { cn } from "@/lib/utils";

interface LocalShopsFinderProps {
  locationLabel: string;
  radiusMiles: LocalRadiusMiles;
  className?: string;
}

export function LocalShopsFinder({
  locationLabel,
  radiusMiles,
  className,
}: LocalShopsFinderProps) {
  const t = useTranslations("shops");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [near, setNear] = useState(
    () => formatCityStateLabel(locationLabel) || locationLabel,
  );
  const [radius, setRadius] = useState<LocalRadiusMiles>(radiusMiles);
  const [detecting, setDetecting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNear(formatCityStateLabel(locationLabel) || locationLabel);
  }, [locationLabel]);

  useEffect(() => {
    setRadius(radiusMiles);
  }, [radiusMiles]);

  function pushParams(nextNear: string, nextRadius: LocalRadiusMiles) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = formatCityStateLabel(nextNear) || nextNear.trim();
    if (trimmed) params.set("near", trimmed);
    else params.delete("near");
    params.set("radius", String(nextRadius));
    params.delete("page");
    params.delete("view");
    // Full navigation so ZIP → city/state resolve always reloads shop results.
    window.location.assign(`${pathname}?${params.toString()}`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmed = near.trim();
    if (!trimmed) {
      pushParams("", radius);
      return;
    }

    setResolving(true);
    try {
      const resolved = await resolveLocationQuery(trimmed);
      if (!resolved) {
        setError(t("locationZipNotFound"));
        return;
      }
      setNear(resolved.label);
      pushParams(resolved.label, radius);
    } catch {
      setError(t("locationZipNotFound"));
    } finally {
      setResolving(false);
    }
  }

  async function detectLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError(t("locationUnsupported"));
      return;
    }
    setDetecting(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
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
      const nextLabel =
        formatCityStateLabel([city, region].filter(Boolean).join(", ")) ||
        [city, region || payload.countryName].filter(Boolean).join(", ");
      if (!nextLabel || !city) throw new Error("empty_location");
      setNear(nextLabel);
      pushParams(nextLabel, radius);
    } catch {
      setError(t("locationDetectFailed"));
    } finally {
      setDetecting(false);
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 lg:flex-row lg:items-center"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0 overflow-hidden rounded-2xl border border-[#ebe4da] bg-white shadow-[0_12px_40px_rgba(49,43,54,0.1)] sm:flex-row sm:items-stretch">
          <label className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 sm:px-5">
            <MapPin
              aria-hidden
              className="size-5 shrink-0 text-marketplace-brand"
              strokeWidth={2.25}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-marketplace-foreground">
                {t("locationInputLabel")}
              </span>
              <input
                value={near}
                onChange={(event) => setNear(event.target.value)}
                placeholder={t("locationInputPlaceholder")}
                autoComplete="postal-code"
                inputMode="text"
                disabled={resolving || detecting}
                className="mt-0.5 w-full border-0 bg-transparent p-0 text-[0.975rem] text-marketplace-foreground outline-none placeholder:text-marketplace-muted-foreground disabled:opacity-60"
              />
            </span>
          </label>

          <div
            className="hidden w-px self-stretch bg-[#ebe4da] sm:block"
            aria-hidden
          />
          <div className="h-px bg-[#ebe4da] sm:hidden" aria-hidden />

          <label className="relative flex w-full shrink-0 items-center gap-3 px-4 py-3.5 sm:w-[14rem] sm:px-5">
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-marketplace-foreground">
                {t("radiusLabel")}
              </span>
              <select
                value={radius}
                onChange={(event) => {
                  const nextRadius = Number(
                    event.target.value,
                  ) as LocalRadiusMiles;
                  setRadius(nextRadius);
                  pushParams(near, nextRadius);
                }}
                className="mt-0.5 w-full appearance-none border-0 bg-transparent p-0 pr-6 text-[0.975rem] text-marketplace-foreground outline-none"
              >
                {LOCAL_RADIUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t("radiusOption", { miles: option })}
                  </option>
                ))}
              </select>
            </span>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-marketplace-muted-foreground"
            />
          </label>

          <div className="flex items-center p-2 sm:pl-0 sm:pr-2">
            <button
              type="submit"
              disabled={resolving || detecting}
              className="h-11 w-full rounded-xl bg-marketplace-brand px-6 text-sm font-semibold text-marketplace-brand-foreground transition-colors hover:bg-marketplace-brand-accent-hover disabled:opacity-60 sm:w-auto"
            >
              {resolving ? t("locationResolving") : t("findShops")}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void detectLocation()}
          disabled={detecting || resolving}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start text-sm font-medium text-marketplace-brand underline underline-offset-4 disabled:opacity-60 lg:self-center"
        >
          <Navigation aria-hidden className="size-4" />
          {detecting ? t("locationDetecting") : t("locationUseMine")}
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
