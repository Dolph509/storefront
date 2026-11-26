"use client";

import type { CustomField, Product, Variant } from "@spree/sdk";
import { Hand, Leaf, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";
import type { MerchandisingSignal } from "@/components/products/MerchandisingBadges";
import type { MadeTogetherPresentation } from "@/lib/made-together/types";

type OddkeepsProductHighlightsProps = {
  product: Product;
  selectedVariant?: Variant | null;
  sku?: string | null;
  relevanceSignals: MerchandisingSignal[];
  madeTogether?: MadeTogetherPresentation | null;
};

type SpecRow = {
  key: string;
  label: string;
  value: ReactNode;
};

function formatCustomFieldValue(
  field: CustomField,
  yesLabel: string,
  noLabel: string,
): ReactNode {
  if (field.value == null || field.value === "") return null;
  switch (field.field_type) {
    case "boolean":
      return field.value ? yesLabel : noLabel;
    case "json":
      return typeof field.value === "string"
        ? field.value
        : JSON.stringify(field.value);
    case "rich_text":
      return (
        <span
          className="prose prose-sm max-w-none text-[#1a1a1a]"
          dangerouslySetInnerHTML={{ __html: String(field.value) }}
        />
      );
    default:
      return String(field.value);
  }
}

function formatDimensions(variant: Variant | null | undefined): string | null {
  if (!variant) return null;
  const parts = [variant.width, variant.height, variant.depth].filter(
    (dim): dim is number => dim != null && Number(dim) > 0,
  );
  if (parts.length === 0) return null;
  const unit = variant.dimensions_unit ? ` ${variant.dimensions_unit}` : "";
  return `${parts.join(" × ")}${unit}`;
}

function formatWeight(variant: Variant | null | undefined): string | null {
  if (!variant || variant.weight == null || Number(variant.weight) <= 0) {
    return null;
  }
  const unit = variant.weight_unit ? ` ${variant.weight_unit}` : "";
  return `${variant.weight}${unit}`;
}

export function OddkeepsProductHighlights({
  product,
  selectedVariant,
  sku,
  relevanceSignals,
  madeTogether,
}: OddkeepsProductHighlightsProps) {
  const t = useTranslations("products");
  const tHandmade = useTranslations("products.handmade");
  const [expanded, setExpanded] = useState(false);

  const highlightChips: Array<{
    label: string;
    icon: "hand" | "leaf" | "sparkles" | "shield" | "users";
  }> = [];
  const pushUniqueChip = (
    label: string | null | undefined,
    icon: "hand" | "leaf" | "sparkles" | "shield" | "users",
  ) => {
    const trimmed = label?.trim();
    if (!trimmed) return;
    if (
      highlightChips.some(
        (item) => item.label.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      return;
    }
    highlightChips.push({ label: trimmed, icon });
  };

  if (madeTogether && madeTogether.makers.length > 1) {
    pushUniqueChip(
      t("coCreatedByMakers", { count: madeTogether.makers.length }),
      "users",
    );
  }
  if (product.handmade_verified) {
    pushUniqueChip(tHandmade("badge"), "hand");
  }
  if (product.authenticity_classification_label) {
    pushUniqueChip(product.authenticity_classification_label, "hand");
  }
  if (product.personalization_fields?.length) {
    pushUniqueChip(t("madeToOrder"), "sparkles");
  }
  for (const signal of relevanceSignals) {
    if (highlightChips.length >= 5) break;
    pushUniqueChip(signal.label, "leaf");
  }
  if (product.accepts_returns && highlightChips.length < 5) {
    pushUniqueChip(t("returnsAcceptedShort"), "shield");
  }

  const activeVariant = selectedVariant ?? product.default_variant ?? null;
  const resolvedSku = sku ?? activeVariant?.sku ?? null;

  const specRows: SpecRow[] = [];
  const seenLabels = new Set<string>();
  const addSpec = (key: string, label: string, value: ReactNode) => {
    if (value == null || value === "") return;
    const normalized = label.trim().toLowerCase();
    if (!normalized || seenLabels.has(normalized)) return;
    seenLabels.add(normalized);
    specRows.push({ key, label: label.trim(), value });
  };

  const mergedCustomFields = [
    ...(product.custom_fields ?? []),
    ...(activeVariant?.custom_fields ?? []),
  ];
  for (const field of mergedCustomFields) {
    const formatted = formatCustomFieldValue(field, t("yes"), t("no"));
    if (formatted != null) {
      addSpec(`cf-${field.id}`, field.label, formatted);
    }
  }

  if (activeVariant?.options_text) {
    addSpec("options", t("options"), activeVariant.options_text);
  }
  if (resolvedSku) {
    addSpec("sku", t("sku"), resolvedSku);
  }
  const dimensions = formatDimensions(activeVariant);
  if (dimensions) {
    addSpec("dimensions", t("dimensions"), dimensions);
  }
  const weight = formatWeight(activeVariant);
  if (weight) {
    addSpec("weight", t("weight"), weight);
  }
  if (
    product.authenticity_classification_label ||
    product.authenticity_disclosure
  ) {
    addSpec(
      "production",
      t("production"),
      product.authenticity_classification_label ||
        product.authenticity_disclosure,
    );
  }
  if (product.ships_from) {
    addSpec("origin", t("origin"), product.ships_from);
  }

  const plainDescription = product.description?.trim() ?? "";
  const hasHtmlDescription = Boolean(product.description_html?.trim());
  const isTruncatable = plainDescription.length > 260;
  const previewText =
    isTruncatable && !expanded
      ? `${plainDescription.slice(0, 260).trimEnd()}…`
      : plainDescription;

  if (
    highlightChips.length === 0 &&
    specRows.length === 0 &&
    !plainDescription &&
    !hasHtmlDescription &&
    !product.custom_order_seller_note
  ) {
    return null;
  }

  const renderIcon = (kind: (typeof highlightChips)[number]["icon"]) => {
    const cls = "size-4 shrink-0 text-[#4a4743] stroke-[1.6]";
    if (kind === "users") return <Users className={cls} aria-hidden />;
    if (kind === "hand") return <Hand className={cls} aria-hidden />;
    if (kind === "sparkles") return <Sparkles className={cls} aria-hidden />;
    if (kind === "shield") return <ShieldCheck className={cls} aria-hidden />;
    return <Leaf className={cls} aria-hidden />;
  };

  return (
    <section data-oddkeeps-highlights className="mt-7 min-w-0">
      <h2 className="font-sans text-[18px] font-semibold tracking-tight text-[#1a1a1a]">
        {t("highlights")}
      </h2>

      {highlightChips.length > 0 ? (
        <ul className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13.5px] text-[#3d3b38]">
          {highlightChips.map((item) => (
            <li key={item.label} className="inline-flex items-center gap-1.5">
              {renderIcon(item.icon)}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {plainDescription || hasHtmlDescription ? (
        <div className="mt-4 text-[14px] leading-[1.65] text-[#45423e]">
          {hasHtmlDescription && (expanded || !plainDescription) ? (
            <div
              className="prose prose-sm max-w-none text-[#45423e]"
              dangerouslySetInnerHTML={{
                __html: product.description_html ?? "",
              }}
            />
          ) : (
            <p>{previewText}</p>
          )}
          {isTruncatable ? (
            <button
              type="button"
              className="mt-2 text-[13px] font-medium text-[#1a1a1a] underline underline-offset-4 hover:opacity-75"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? t("readLess") : t("readMore")}
            </button>
          ) : null}
        </div>
      ) : null}

      {product.custom_order_seller_note ? (
        <p className="mt-3 rounded-lg bg-[#f6f4f0] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#45423e]">
          {product.custom_order_seller_note}
        </p>
      ) : null}

      {specRows.length > 0 ? (
        <div className="mt-5 border-t border-[#f0ede8] pt-4">
          <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.04em] text-[#6f6c68]">
            {t("specifications")}
          </h3>
          <dl className="mt-3 grid grid-cols-1 gap-x-10 gap-y-2.5 sm:grid-cols-2">
            {specRows.map((spec) => (
              <div
                key={spec.key}
                className="grid grid-cols-1 gap-0.5 border-b border-[#f0ede8] pb-2 text-[13.5px] sm:grid-cols-[minmax(6.5rem,auto)_1fr] sm:items-baseline sm:gap-x-3"
              >
                <dt className="text-[#6f6c68]">{spec.label}</dt>
                <dd className="min-w-0 font-medium text-[#1a1a1a]">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
