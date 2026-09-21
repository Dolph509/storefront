import type {
  PersonalizationSelectionInput,
  ProductPersonalizationChoice,
  ProductPersonalizationField,
} from "@spree/sdk";

export type PersonalizationAnswer = {
  value?: string | boolean | null;
  choice_ids?: string[];
  signed_ids?: string[];
  /** Client-only filename labels for uploads — never sent to the API. */
  file_names?: string[];
};

export type PersonalizationAnswers = Record<string, PersonalizationAnswer>;

export function sortPersonalizationFields(
  fields: ProductPersonalizationField[] | undefined | null,
): ProductPersonalizationField[] {
  return [...(fields ?? [])].sort((a, b) => a.position - b.position);
}

export function sortPersonalizationChoices(
  choices: ProductPersonalizationChoice[] | undefined | null,
): ProductPersonalizationChoice[] {
  return [...(choices ?? [])].sort((a, b) => a.position - b.position);
}

function answerCompareValue(
  field: ProductPersonalizationField,
  answer: PersonalizationAnswer | undefined,
): string {
  if (!answer) return "";

  if (field.field_type === "boolean" || field.field_type === "checkbox") {
    return answer.value === true || answer.value === "true" ? "true" : "false";
  }

  if (
    field.field_type === "dropdown" ||
    field.field_type === "radio" ||
    field.field_type === "swatch" ||
    field.field_type === "multi_select"
  ) {
    const choice = sortPersonalizationChoices(field.choices).find((c) =>
      (answer.choice_ids ?? []).includes(c.id),
    );
    return choice?.key ?? String(answer.value ?? "");
  }

  return String(answer.value ?? "");
}

export function isPersonalizationFieldVisible(
  field: ProductPersonalizationField,
  fields: ProductPersonalizationField[],
  answers: PersonalizationAnswers,
): boolean {
  if (!field.visible_when_field_id) return true;
  const gate = fields.find((f) => f.id === field.visible_when_field_id);
  if (!gate) return true;
  return (
    answerCompareValue(gate, answers[gate.id]) ===
    String(field.visible_when_equals ?? "")
  );
}

export function visiblePersonalizationFields(
  fields: ProductPersonalizationField[],
  answers: PersonalizationAnswers,
): ProductPersonalizationField[] {
  const ordered = sortPersonalizationFields(fields);
  return ordered.filter((field) =>
    isPersonalizationFieldVisible(field, ordered, answers),
  );
}

/** Drop answers for fields that are currently hidden. */
export function effectivePersonalizationAnswers(
  fields: ProductPersonalizationField[],
  answers: PersonalizationAnswers,
): PersonalizationAnswers {
  const visible = new Set(
    visiblePersonalizationFields(fields, answers).map((f) => f.id),
  );
  const next: PersonalizationAnswers = {};
  for (const [fieldId, answer] of Object.entries(answers)) {
    if (visible.has(fieldId)) next[fieldId] = answer;
  }
  return next;
}

export function buildPersonalizationPayload(
  fields: ProductPersonalizationField[],
  answers: PersonalizationAnswers,
): PersonalizationSelectionInput[] {
  const effective = effectivePersonalizationAnswers(fields, answers);
  const payload: PersonalizationSelectionInput[] = [];

  for (const field of visiblePersonalizationFields(fields, answers)) {
    if (field.field_type === "info") continue;

    const answer = effective[field.id];
    if (!answer) continue;

    if (field.field_type === "file") {
      const signed_ids = (answer.signed_ids ?? []).filter(Boolean);
      if (signed_ids.length === 0) continue;
      payload.push({ field_id: field.id, signed_ids });
      continue;
    }

    if (
      field.field_type === "dropdown" ||
      field.field_type === "radio" ||
      field.field_type === "swatch" ||
      field.field_type === "multi_select" ||
      field.field_type === "checkbox"
    ) {
      // Single checkbox-as-boolean uses value; multi checkbox uses choice_ids.
      if (
        field.field_type === "checkbox" &&
        (!field.choices || field.choices.length === 0)
      ) {
        if (answer.value === true || answer.value === "true") {
          payload.push({ field_id: field.id, value: true });
        }
        continue;
      }

      const choice_ids = (answer.choice_ids ?? []).filter(Boolean);
      if (choice_ids.length === 0) continue;
      payload.push({ field_id: field.id, choice_ids });
      continue;
    }

    if (field.field_type === "boolean") {
      if (answer.value === true || answer.value === "true") {
        payload.push({ field_id: field.id, value: true });
      } else if (answer.value === false || answer.value === "false") {
        payload.push({ field_id: field.id, value: false });
      }
      continue;
    }

    const value = answer.value;
    if (value == null || value === "") continue;
    payload.push({ field_id: field.id, value: String(value) });
  }

  return payload;
}

export type PersonalizationFieldError = {
  fieldId: string;
  code:
    | "required"
    | "min_length"
    | "max_length"
    | "choice_required"
    | "file_required";
};

export function validatePersonalizationAnswers(
  fields: ProductPersonalizationField[],
  answers: PersonalizationAnswers,
): PersonalizationFieldError[] {
  const errors: PersonalizationFieldError[] = [];

  for (const field of visiblePersonalizationFields(fields, answers)) {
    if (field.field_type === "info") continue;
    const answer = answers[field.id];

    if (field.field_type === "file") {
      if (field.required && !answer?.signed_ids?.length) {
        errors.push({ fieldId: field.id, code: "file_required" });
      }
      continue;
    }

    if (
      field.field_type === "dropdown" ||
      field.field_type === "radio" ||
      field.field_type === "swatch" ||
      field.field_type === "multi_select" ||
      (field.field_type === "checkbox" && (field.choices?.length ?? 0) > 0)
    ) {
      if (field.required && !answer?.choice_ids?.length) {
        errors.push({ fieldId: field.id, code: "choice_required" });
      }
      continue;
    }

    if (field.field_type === "boolean" || field.field_type === "checkbox") {
      if (
        field.required &&
        !(answer?.value === true || answer?.value === "true")
      ) {
        errors.push({ fieldId: field.id, code: "required" });
      }
      continue;
    }

    const text = String(answer?.value ?? "");
    if (field.required && text.trim() === "") {
      errors.push({ fieldId: field.id, code: "required" });
      continue;
    }
    if (text && field.min_length != null && text.length < field.min_length) {
      errors.push({ fieldId: field.id, code: "min_length" });
    }
    if (text && field.max_length != null && text.length > field.max_length) {
      errors.push({ fieldId: field.id, code: "max_length" });
    }
  }

  return errors;
}

/**
 * Best-effort mapping of Spree cart personalization validation messages onto
 * visible fields. Backend messages typically include the field name.
 */
export function mapServerPersonalizationErrors(
  fields: ProductPersonalizationField[],
  details: Record<string, unknown> | undefined,
  message?: string,
): PersonalizationFieldError[] {
  const texts: string[] = [];
  if (message) texts.push(message);
  if (details) {
    for (const value of Object.values(details)) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          if (typeof entry === "string") texts.push(entry);
          else if (entry && typeof entry === "object" && "message" in entry) {
            texts.push(String((entry as { message: unknown }).message));
          }
        }
      } else if (typeof value === "string") {
        texts.push(value);
      }
    }
  }

  if (texts.length === 0) return [];

  const joined = texts.join(" ").toLowerCase();
  const mapped: PersonalizationFieldError[] = [];

  for (const field of fields) {
    if (field.field_type === "info") continue;
    const name = field.name.toLowerCase();
    const key = field.key?.toLowerCase() ?? "";
    const mentions =
      (name && joined.includes(name)) || (key && joined.includes(key));
    if (!mentions) continue;

    let code: PersonalizationFieldError["code"] = "required";
    if (/too short|min/.test(joined)) code = "min_length";
    else if (/too long|max/.test(joined)) code = "max_length";
    else if (/invalid choice|inactive/.test(joined)) code = "choice_required";
    else if (/upload|file|attachment|signed/.test(joined))
      code = "file_required";
    else if (
      field.field_type === "dropdown" ||
      field.field_type === "radio" ||
      field.field_type === "swatch" ||
      field.field_type === "multi_select"
    ) {
      code = "choice_required";
    } else if (field.field_type === "file") {
      code = "file_required";
    }

    mapped.push({ fieldId: field.id, code });
  }

  return mapped;
}

function parseAmount(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Display-only unit surcharge estimate from the public schema. */
export function estimatePersonalizationUnitSurcharge(
  fields: ProductPersonalizationField[],
  answers: PersonalizationAnswers,
): number {
  let total = 0;
  for (const field of visiblePersonalizationFields(fields, answers)) {
    if (field.field_type === "info") continue;
    const answer = answers[field.id];
    if (!answer) continue;

    if (
      field.field_type === "boolean" ||
      (field.field_type === "checkbox" && !field.choices?.length)
    ) {
      if (answer.value === true || answer.value === "true") {
        total += parseAmount(field.price_adjustment);
      }
      continue;
    }

    if (
      field.field_type === "dropdown" ||
      field.field_type === "radio" ||
      field.field_type === "swatch" ||
      field.field_type === "multi_select" ||
      field.field_type === "checkbox"
    ) {
      const selected = new Set(answer.choice_ids ?? []);
      for (const choice of field.choices ?? []) {
        if (selected.has(choice.id)) {
          total += parseAmount(choice.price_adjustment);
        }
      }
      continue;
    }

    if (
      (field.field_type === "short_text" ||
        field.field_type === "long_text" ||
        field.field_type === "file") &&
      ((typeof answer.value === "string" && answer.value.trim() !== "") ||
        (answer.signed_ids?.length ?? 0) > 0)
    ) {
      total += parseAmount(field.price_adjustment);
    }
  }
  return total;
}

export type SnapshotEntry = {
  label: string;
  value: string;
  fieldType?: string;
  attachmentIds?: string[];
};

export function formatPersonalizationSnapshot(
  snapshot: Array<Record<string, unknown>> | null | undefined,
): SnapshotEntry[] {
  if (!Array.isArray(snapshot)) return [];

  return snapshot.map((raw) => {
    const label = String(raw.label ?? raw.key ?? "");
    const fieldType =
      raw.field_type != null ? String(raw.field_type) : undefined;
    const attachmentIds = Array.isArray(raw.attachment_signed_ids)
      ? (raw.attachment_signed_ids as unknown[]).map(String)
      : [];

    let value = "";
    if (Array.isArray(raw.choice_labels) && raw.choice_labels.length > 0) {
      value = (raw.choice_labels as unknown[]).map(String).join(", ");
    } else if (typeof raw.value === "boolean") {
      value = raw.value ? "true" : "false";
    } else if (Array.isArray(raw.value)) {
      value = raw.value.map(String).join(", ");
    } else if (raw.value != null && raw.value !== "") {
      value = String(raw.value);
    } else if (attachmentIds.length > 0) {
      value =
        attachmentIds.length === 1 ? "1 file" : `${attachmentIds.length} files`;
    }

    return { label, value, fieldType, attachmentIds };
  });
}
