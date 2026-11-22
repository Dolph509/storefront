"use client";

import type { OptionType, Variant } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { SwatchSelect } from "@/components/products/SwatchSelect";

type OddkeepsReferenceVariantPickerProps = {
  variants: Variant[];
  optionTypes: OptionType[];
  selectedVariant: Variant | null;
  onVariantChange: (variant: Variant | null) => void;
};

export function OddkeepsReferenceVariantPicker({
  variants,
  optionTypes,
  selectedVariant,
  onVariantChange,
}: OddkeepsReferenceVariantPickerProps) {
  const t = useTranslations("products");
  const optionValuesMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const optionType of optionTypes) {
      map[optionType.id] = new Set();
    }
    for (const variant of variants) {
      for (const optionValue of variant.option_values) {
        map[optionValue.option_type_id]?.add(optionValue.name);
      }
    }
    return map;
  }, [variants, optionTypes]);

  const selectedOptions = useMemo(() => {
    const options: Record<string, string> = {};
    if (selectedVariant) {
      for (const ov of selectedVariant.option_values) {
        options[ov.option_type_id] = ov.name;
      }
    }
    return options;
  }, [selectedVariant]);

  const { variantOptionMaps, optionValueDetailsMap } = useMemo(() => {
    const maps = variants.map((variant) => {
      const optionsMap: Record<string, string> = {};
      for (const ov of variant.option_values) {
        optionsMap[ov.option_type_id] = ov.name;
      }
      return { variant, optionsMap };
    });

    const detailsMap: Record<string, Variant["option_values"][0]> = {};
    for (const variant of variants) {
      for (const ov of variant.option_values) {
        const key = `${ov.option_type_id}:${ov.name}`;
        if (!detailsMap[key]) detailsMap[key] = ov;
      }
    }
    return { variantOptionMaps: maps, optionValueDetailsMap: detailsMap };
  }, [variants]);

  const findVariant = (nextOptions: Record<string, string>): Variant | null => {
    const count = Object.keys(nextOptions).length;
    return (
      variantOptionMaps.find(
        ({ variant, optionsMap }) =>
          variant.option_values.length === count &&
          Object.entries(nextOptions).every(
            ([typeId, value]) => optionsMap[typeId] === value,
          ),
      )?.variant || null
    );
  };

  const isOptionAvailable = (typeId: string, value: string): boolean => {
    const test = { ...selectedOptions, [typeId]: value };
    return variantOptionMaps.some(({ optionsMap }) =>
      Object.entries(test).every(([id, val]) => optionsMap[id] === val),
    );
  };

  const isOptionPurchasable = (typeId: string, value: string): boolean => {
    const test = { ...selectedOptions, [typeId]: value };
    return variantOptionMaps.some(
      ({ variant, optionsMap }) =>
        variant.purchasable &&
        Object.entries(test).every(([id, val]) => optionsMap[id] === val),
    );
  };

  if (optionTypes.length === 0) return null;

  return (
    <div className="space-y-4">
      {optionTypes.map((optionType) => {
        const values = Array.from(optionValuesMap[optionType.id] || []);
        const selectedValue = selectedOptions[optionType.id] || "";
        const isColor =
          optionType.kind === "color_swatch" ||
          /^(color|colour|finish)$/i.test(optionType.label.trim());

        const selectOptions = values.map((value) => {
          const detail = optionValueDetailsMap[`${optionType.id}:${value}`];
          const available = isOptionAvailable(optionType.id, value);
          const purchasable = isOptionPurchasable(optionType.id, value);
          const label = detail?.label || value;
          return {
            value,
            label:
              !purchasable && available
                ? `${label} — ${t("outOfStockVariant")}`
                : label,
            color: detail?.color_code,
            imageUrl: detail?.image_url,
            disabled: !available,
          };
        });

        return (
          <div key={optionType.id}>
            <label
              htmlFor={`oddkeeps-option-${optionType.id}`}
              className="mb-2 block text-[13px] font-semibold text-[#1a1a1a]"
            >
              {optionType.label}
            </label>
            {isColor ? (
              <SwatchSelect
                id={`oddkeeps-option-${optionType.id}`}
                label={optionType.label}
                value={selectedValue}
                placeholder={t("selectOption")}
                options={selectOptions}
                onChange={(value) =>
                  onVariantChange(
                    findVariant({
                      ...selectedOptions,
                      [optionType.id]: value,
                    }),
                  )
                }
              />
            ) : (
              <select
                id={`oddkeeps-option-${optionType.id}`}
                value={selectedValue}
                aria-label={optionType.label}
                onChange={(event) => {
                  const value = event.target.value;
                  if (!value) {
                    onVariantChange(null);
                    return;
                  }
                  onVariantChange(
                    findVariant({
                      ...selectedOptions,
                      [optionType.id]: value,
                    }),
                  );
                }}
                className="pdp-reference-select"
              >
                <option value="" disabled>
                  {t("selectOption")}
                </option>
                {selectOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}
