"use client";

import { ArrowDown, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MadeTogetherMakerAvatar } from "@/components/products/MadeTogetherMakerAvatar";
import type { MadeTogetherPresentation } from "@/lib/made-together/types";

type MadeTogetherCompactProps = {
  presentation: MadeTogetherPresentation;
};

export function MadeTogetherCompact({
  presentation,
}: MadeTogetherCompactProps) {
  const t = useTranslations("products");
  const { makers, compactRating } = presentation;
  const visibleAvatars = makers.slice(0, 3);
  const extraCount = Math.max(0, makers.length - visibleAvatars.length);
  const featuredContribution = makers.find((maker) =>
    Boolean(maker.craftContribution?.trim()),
  );

  const handleJumpToCollective = () => {
    const el = document.getElementById("made-together-collective");
    if (!el) return;
    if (el instanceof HTMLDetailsElement) {
      el.open = true;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      data-made-together-compact
      className="rounded-[14px] border border-[#e6e2da] bg-[#faf8f4] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9f1ec] px-2.5 py-0.5 text-[11.5px] font-semibold tracking-[0.01em] text-[#1b4332]">
          <Sparkles className="size-3 shrink-0" aria-hidden />
          {t("creativeCollaborative")}
        </span>
        <button
          type="button"
          onClick={handleJumpToCollective}
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[#1b4332] underline decoration-[#1b4332]/40 underline-offset-4 transition-colors hover:decoration-[#1b4332]"
        >
          <span>{t("madeTogetherMeetLink")}</span>
          <ArrowDown className="size-3" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3.5">
        <div className="flex shrink-0 items-center">
          {visibleAvatars.map((maker, index) => (
            <span
              key={maker.key}
              className={`inline-flex rounded-full ${index > 0 ? "-ml-2.5" : ""}`}
              style={{ zIndex: visibleAvatars.length - index }}
            >
              <MadeTogetherMakerAvatar
                name={maker.name}
                logoUrl={maker.logoUrl}
                href={maker.href}
                variantIndex={index}
                className="size-10"
                ringClassName="ring-2 ring-[#faf8f4]"
              />
            </span>
          ))}
          {extraCount > 0 ? (
            <span className="-ml-2.5 inline-flex size-10 items-center justify-center rounded-full bg-[#eae6df] text-[11px] font-semibold text-[#3d3b38] ring-2 ring-[#faf8f4]">
              +{extraCount}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-[14.5px] font-semibold leading-snug text-[#1a1a1a]">
              {makers.map((maker, index) => (
                <span key={maker.key}>
                  {index > 0 ? (
                    <span
                      className="font-normal text-[#6f6c68]"
                      aria-hidden="true"
                    >
                      {" & "}
                    </span>
                  ) : null}
                  {maker.href ? (
                    <Link
                      href={maker.href}
                      className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-[#1a1a1a]"
                    >
                      {maker.name}
                    </Link>
                  ) : (
                    maker.name
                  )}
                </span>
              ))}
            </p>
            {compactRating != null ? (
              <span className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-[#1a1a1a]">
                <Star
                  className="size-3.5 fill-[#1b4332] text-[#1b4332]"
                  aria-hidden
                />
                {compactRating.toFixed(1)}
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 line-clamp-1 text-[13px] text-[#595652]">
            {featuredContribution?.craftContribution
              ? `${featuredContribution.name}: ${featuredContribution.craftContribution}`
              : t("coCreatedByMakers", { count: makers.length })}
          </p>
        </div>
      </div>
    </div>
  );
}
