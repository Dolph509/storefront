import type {
  GiftFinderRequirementLevel,
  GiftFinderSearchParams,
} from "@spree/sdk";

export type BudgetPreset = "25" | "50" | "100" | "open" | "custom";

export type GiftAnswers = {
  recipient?: string;
  occasion?: string;
  interests: string[];
  customInterests: string[];
  styles: string[];
  ageRange?: string;
  excludeInterests: string[];
  budgetPreset: BudgetPreset;
  budgetMin: string;
  budgetMax: string;
  budgetFlexible: boolean;
  personalization: GiftFinderRequirementLevel;
  localMakers: GiftFinderRequirementLevel;
  shipToCountry: string;
  shipToState: string;
  deliverBy: string;
  deadlineFlexible: boolean;
};

export function emptyAnswers(shipToCountry: string): GiftAnswers {
  return {
    interests: [],
    customInterests: [],
    styles: [],
    excludeInterests: [],
    budgetPreset: "open",
    budgetMin: "",
    budgetMax: "",
    budgetFlexible: false,
    personalization: "any",
    localMakers: "any",
    shipToCountry: shipToCountry.toUpperCase(),
    shipToState: "",
    deliverBy: "",
    deadlineFlexible: false,
  };
}

function money(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

export function toSearchParams(
  answers: GiftAnswers,
  extras: {
    page?: number;
    parentSearchId?: string | null;
    sessionToken?: string;
    concepts?: { key: string; label: string }[];
    maxInterests?: number;
  } = {},
): GiftFinderSearchParams {
  const params: GiftFinderSearchParams = {
    personalization: answers.personalization,
    local_makers: answers.localMakers,
    budget_flexible: answers.budgetFlexible,
    deadline_flexible: answers.deadlineFlexible,
    page: extras.page ?? 1,
    per_page: 24,
  };

  if (answers.recipient) params.recipient = answers.recipient;
  if (answers.occasion) params.occasion = answers.occasion;
  const interests = new Set(answers.interests);
  const phrases: string[] = [];
  const normalize = (text: string) =>
    text.trim().toLowerCase().replace(/[_-]+/g, " ");
  const vocabulary = new Map<string, string>();
  for (const concept of extras.concepts ?? []) {
    vocabulary.set(normalize(concept.label), concept.key);
    vocabulary.set(normalize(concept.key), concept.key);
  }
  for (const phrase of answers.customInterests) {
    const term = normalize(phrase);
    const parts = vocabulary.has(term)
      ? [term]
      : term.split(/\s*(?:[,;&+]|\b(?:and|et|und|y|oraz)\b)\s*/u);
    const keys = parts.map((part) => vocabulary.get(part));
    if (
      keys.every(
        (key): key is string =>
          !!key && !answers.excludeInterests.includes(key),
      ) &&
      new Set([...interests, ...keys]).size <= (extras.maxInterests ?? Infinity)
    ) {
      for (const key of keys) {
        interests.add(key);
      }
    } else {
      phrases.push(phrase);
    }
  }
  if (interests.size) params.interests = [...interests];
  if (phrases.length) params.custom_interests = phrases;
  if (answers.styles.length) params.styles = answers.styles;
  if (answers.ageRange) params.age_range = answers.ageRange;
  if (answers.excludeInterests.length)
    params.exclude_interests = answers.excludeInterests;
  if (answers.shipToCountry) params.ship_to_country = answers.shipToCountry;
  if (answers.shipToState) params.ship_to_state = answers.shipToState;
  if (answers.deliverBy) params.deliver_by = answers.deliverBy;
  if (extras.parentSearchId) params.parent_search_id = extras.parentSearchId;
  if (extras.sessionToken) params.session_token = extras.sessionToken;

  if (answers.budgetPreset === "25") params.budget_max = "25";
  if (answers.budgetPreset === "50") params.budget_max = "50";
  if (answers.budgetPreset === "100") params.budget_max = "100";
  if (answers.budgetPreset === "custom") {
    const min = money(answers.budgetMin);
    const max = money(answers.budgetMax);
    if (min) params.budget_min = min;
    if (max) params.budget_max = max;
  }

  return params;
}

/**
 * Applies one relaxation the buyer chose. Nothing here runs unless they accept it.
 */
export function applyRelaxation(
  answers: GiftAnswers,
  change: string,
  value?: string,
): GiftAnswers {
  if (change === "widen_budget") {
    if (value) {
      return {
        ...answers,
        budgetPreset: "custom",
        budgetMax: value,
        budgetFlexible: false,
      };
    }
    return { ...answers, budgetFlexible: true };
  }
  if (change === "allow_later_delivery") {
    return { ...answers, deadlineFlexible: true };
  }
  if (change === "make_personalization_optional") {
    return { ...answers, personalization: "preferred" };
  }
  if (change === "prefer_local_makers") {
    return { ...answers, localMakers: "preferred" };
  }
  return answers;
}
