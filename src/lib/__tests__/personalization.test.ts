import type { ProductPersonalizationField } from "@spree/sdk";
import { describe, expect, it } from "vitest";
import {
  buildPersonalizationPayload,
  effectivePersonalizationAnswers,
  estimatePersonalizationUnitSurcharge,
  formatPersonalizationSnapshot,
  isPersonalizationFieldVisible,
  mapServerPersonalizationErrors,
  sortPersonalizationFields,
  validatePersonalizationAnswers,
  visiblePersonalizationFields,
} from "@/lib/personalization";

function field(
  overrides: Partial<ProductPersonalizationField> &
    Pick<ProductPersonalizationField, "id" | "field_type" | "name">,
): ProductPersonalizationField {
  return {
    key: overrides.key ?? overrides.id,
    position: overrides.position ?? 0,
    required: overrides.required ?? false,
    instructions: null,
    placeholder: null,
    min_length: null,
    max_length: null,
    price_adjustment: "0.0",
    visible_when_field_id: null,
    visible_when_equals: null,
    choices: [],
    configuration: null,
    ...overrides,
  } as ProductPersonalizationField;
}

describe("personalization helpers", () => {
  it("sorts fields by server position, not name", () => {
    const fields = [
      field({ id: "b", name: "Alpha", field_type: "short_text", position: 2 }),
      field({ id: "a", name: "Zulu", field_type: "short_text", position: 1 }),
    ];
    expect(sortPersonalizationFields(fields).map((f) => f.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("hides conditional fields until the gate matches", () => {
    const gate = field({
      id: "ppf_gate",
      name: "Add engraving?",
      field_type: "boolean",
      position: 1,
    });
    const child = field({
      id: "ppf_text",
      name: "Engraving",
      field_type: "short_text",
      position: 2,
      required: true,
      visible_when_field_id: "ppf_gate",
      visible_when_equals: "true",
    });

    expect(isPersonalizationFieldVisible(child, [gate, child], {})).toBe(false);
    expect(
      isPersonalizationFieldVisible(child, [gate, child], {
        ppf_gate: { value: true },
      }),
    ).toBe(true);
  });

  it("excludes hidden answers from payload and estimates", () => {
    const gate = field({
      id: "ppf_gate",
      name: "Add engraving?",
      field_type: "boolean",
      position: 1,
      price_adjustment: "10.0",
    });
    const child = field({
      id: "ppf_text",
      name: "Engraving",
      field_type: "short_text",
      position: 2,
      required: true,
      price_adjustment: "5.0",
      visible_when_field_id: "ppf_gate",
      visible_when_equals: "true",
    });
    const answers = {
      ppf_gate: { value: false },
      ppf_text: { value: "Sarah" },
    };

    expect(effectivePersonalizationAnswers([gate, child], answers)).toEqual({
      ppf_gate: { value: false },
    });
    expect(validatePersonalizationAnswers([gate, child], answers)).toEqual([]);
    expect(buildPersonalizationPayload([gate, child], answers)).toEqual([
      { field_id: "ppf_gate", value: false },
    ]);
    expect(estimatePersonalizationUnitSurcharge([gate, child], answers)).toBe(
      0,
    );
  });

  it("validates required text, length, choice, and file rules", () => {
    const fields = [
      field({
        id: "ppf_name",
        name: "Name",
        field_type: "short_text",
        required: true,
        min_length: 2,
        max_length: 5,
      }),
      field({
        id: "ppf_font",
        name: "Font",
        field_type: "radio",
        required: true,
        choices: [
          {
            id: "ppc_1",
            key: "modern",
            name: "Modern",
            position: 1,
            price_adjustment: "0",
            swatch_value: null,
          },
        ],
      } as ProductPersonalizationField),
      field({
        id: "ppf_file",
        name: "Photo",
        field_type: "file",
        required: true,
      }),
    ];

    expect(
      validatePersonalizationAnswers(fields, {
        ppf_name: { value: "S" },
      }).map((e) => e.code),
    ).toEqual(["min_length", "choice_required", "file_required"]);

    expect(
      validatePersonalizationAnswers(fields, {
        ppf_name: { value: "SarahX" },
        ppf_font: { choice_ids: ["ppc_1"] },
        ppf_file: { signed_ids: ["sig"] },
      }).map((e) => e.code),
    ).toEqual(["max_length"]);
  });

  it("builds answer-only payloads without prices or fingerprints", () => {
    const fields = [
      field({
        id: "ppf_name",
        name: "Name",
        field_type: "short_text",
        price_adjustment: "10",
      }),
      field({
        id: "ppf_finish",
        name: "Finish",
        field_type: "swatch",
        choices: [
          {
            id: "ppc_w",
            key: "walnut",
            name: "Walnut",
            position: 1,
            price_adjustment: "20",
            swatch_value: "#5C4033",
          },
        ],
      } as ProductPersonalizationField),
      field({ id: "ppf_info", name: "Note", field_type: "info" }),
      field({
        id: "ppf_file",
        name: "Photo",
        field_type: "file",
      }),
    ];

    const payload = buildPersonalizationPayload(fields, {
      ppf_name: { value: "Sarah" },
      ppf_finish: { choice_ids: ["ppc_w"] },
      ppf_file: { signed_ids: ["blob_signed"], file_names: ["art.png"] },
    });

    expect(payload).toEqual([
      { field_id: "ppf_name", value: "Sarah" },
      { field_id: "ppf_finish", choice_ids: ["ppc_w"] },
      { field_id: "ppf_file", signed_ids: ["blob_signed"] },
    ]);
    expect(JSON.stringify(payload)).not.toMatch(/price|fingerprint|fee/i);
  });

  it("sums field and choice adjustments for display-only estimates", () => {
    const fields = [
      field({
        id: "ppf_engrave",
        name: "Engrave",
        field_type: "short_text",
        price_adjustment: "10",
      }),
      field({
        id: "ppf_opts",
        name: "Extras",
        field_type: "multi_select",
        choices: [
          {
            id: "ppc_a",
            key: "gift",
            name: "Gift box",
            position: 1,
            price_adjustment: "5",
            swatch_value: null,
          },
          {
            id: "ppc_b",
            key: "rush",
            name: "Rush",
            position: 2,
            price_adjustment: "15",
            swatch_value: null,
          },
        ],
      } as ProductPersonalizationField),
    ];

    expect(
      estimatePersonalizationUnitSurcharge(fields, {
        ppf_engrave: { value: "Sarah" },
        ppf_opts: { choice_ids: ["ppc_a", "ppc_b"] },
      }),
    ).toBe(30);
  });

  it("formats historical snapshot labels, not live schema names", () => {
    const entries = formatPersonalizationSnapshot([
      { label: "Name to engrave", value: "Sarah", key: "name" },
      { label: "Finish", choice_labels: ["Walnut"] },
    ]);
    expect(entries.map((e) => e.label)).toEqual(["Name to engrave", "Finish"]);
    expect(entries.map((e) => e.value)).toEqual(["Sarah", "Walnut"]);
  });

  it("maps server validation messages onto fields when possible", () => {
    const fields = [
      field({
        id: "ppf_name",
        name: "Name to engrave",
        field_type: "short_text",
      }),
      field({ id: "ppf_font", name: "Font", field_type: "radio" }),
    ];
    const mapped = mapServerPersonalizationErrors(
      fields,
      { base: ["Name to engrave is too short"] },
      "Name to engrave is too short",
    );
    expect(mapped).toEqual([{ fieldId: "ppf_name", code: "min_length" }]);
  });

  it("does not treat info fields as visible answers", () => {
    const info = field({
      id: "ppf_info",
      name: "Please write clearly",
      field_type: "info",
      required: true,
    });
    expect(visiblePersonalizationFields([info], {})).toHaveLength(1);
    expect(buildPersonalizationPayload([info], {})).toEqual([]);
    expect(validatePersonalizationAnswers([info], {})).toEqual([]);
  });
});
