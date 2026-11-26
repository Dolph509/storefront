import { applyRelaxation, emptyAnswers, toSearchParams } from "./answers";

describe("gift finder answers", () => {
  it("uses catalog concepts for compound interests and preserves niche phrases", () => {
    const answers = {
      ...emptyAnswers("us"),
      customInterests: ["Coffee and art", "blue porcelain"],
    };
    const concepts = [
      { key: "coffee", label: "Coffee" },
      { key: "art", label: "Art" },
    ];
    const query = toSearchParams(answers, { concepts, maxInterests: 2 });
    expect(query.interests).toEqual(["coffee", "art"]);
    expect(query.custom_interests).toEqual(["blue porcelain"]);
    expect(query.budget_max).toBeUndefined();
    expect(
      toSearchParams(answers, { concepts, maxInterests: 1 }).custom_interests,
    ).toEqual(answers.customInterests);
  });
  it("sends firm budget, destination and delivery as the buyer set them", () => {
    const answers = {
      ...emptyAnswers("us"),
      recipient: "friend",
      occasion: "birthday",
      interests: ["gardening"],
      budgetPreset: "50" as const,
      deliverBy: "2026-12-20",
      personalization: "required" as const,
    };

    expect(toSearchParams(answers)).toMatchObject({
      recipient: "friend",
      occasion: "birthday",
      interests: ["gardening"],
      budget_max: "50",
      budget_flexible: false,
      ship_to_country: "US",
      deliver_by: "2026-12-20",
      deadline_flexible: false,
      personalization: "required",
    });
  });

  it("does not change a hard requirement until the buyer accepts a relaxation", () => {
    const answers = emptyAnswers("us");
    expect(answers.deadlineFlexible).toBe(false);
    expect(
      applyRelaxation(answers, "allow_later_delivery").deadlineFlexible,
    ).toBe(true);
    expect(
      applyRelaxation(answers, "make_personalization_optional").personalization,
    ).toBe("preferred");
    expect(applyRelaxation(answers, "widen_budget", "75")).toMatchObject({
      budgetPreset: "custom",
      budgetMax: "75",
      budgetFlexible: false,
    });
  });
});
