import type { ProductPersonalizationField } from "@spree/sdk";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProductPersonalizationForm } from "@/components/products/ProductPersonalizationForm";
import type { PersonalizationAnswers } from "@/lib/personalization";

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, values?: Record<string, unknown>) => {
      if (key === "charactersRemaining") return `${values?.count} remaining`;
      if (key === "errors.required") return "required";
      if (key === "errors.min_length") return `min ${values?.min}`;
      if (key === "errors.max_length") return `max ${values?.max}`;
      if (key === "errors.choice_required") return "choose";
      if (key === "errors.file_required") return "file required";
      return key;
    };
    return t;
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/us/en/products/sign",
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: "c1" } }),
}));

vi.mock("@/lib/data/personalization-uploads", () => ({
  uploadPersonalizationFile: vi.fn(),
}));

function field(
  overrides: Partial<ProductPersonalizationField> &
    Pick<ProductPersonalizationField, "id" | "field_type" | "name">,
): ProductPersonalizationField {
  return {
    key: overrides.key ?? overrides.id,
    position: overrides.position ?? 0,
    required: false,
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

describe("ProductPersonalizationForm", () => {
  it("renders supported field types", () => {
    const fields = [
      field({ id: "t1", name: "Short", field_type: "short_text", position: 1 }),
      field({ id: "t2", name: "Long", field_type: "long_text", position: 2 }),
      field({
        id: "d1",
        name: "Dropdown",
        field_type: "dropdown",
        position: 3,
        choices: [
          {
            id: "c1",
            key: "a",
            name: "Option A",
            position: 1,
            price_adjustment: "0",
            swatch_value: null,
          },
        ],
      } as ProductPersonalizationField),
      field({
        id: "r1",
        name: "Radio",
        field_type: "radio",
        position: 4,
        choices: [
          {
            id: "c2",
            key: "b",
            name: "Option B",
            position: 1,
            price_adjustment: "0",
            swatch_value: null,
          },
        ],
      } as ProductPersonalizationField),
      field({ id: "b1", name: "Boolean", field_type: "boolean", position: 5 }),
      field({
        id: "m1",
        name: "Multi",
        field_type: "multi_select",
        position: 6,
        choices: [
          {
            id: "c3",
            key: "c",
            name: "Extra",
            position: 1,
            price_adjustment: "5",
            swatch_value: null,
          },
        ],
      } as ProductPersonalizationField),
      field({
        id: "s1",
        name: "Swatch",
        field_type: "swatch",
        position: 7,
        choices: [
          {
            id: "c4",
            key: "walnut",
            name: "Walnut",
            position: 1,
            price_adjustment: "20",
            swatch_value: "#5C4033",
          },
        ],
      } as ProductPersonalizationField),
      field({ id: "f1", name: "Photo", field_type: "file", position: 8 }),
      field({
        id: "i1",
        name: "Info note",
        field_type: "info",
        position: 9,
        instructions: "Write clearly",
      }),
    ];

    render(
      <ProductPersonalizationForm
        fields={fields}
        answers={{}}
        onChange={() => undefined}
        baseDisplayPrice="$50.00"
        baseUnitAmount={50}
        currency="USD"
      />,
    );

    expect(screen.getByText("Short")).toBeInTheDocument();
    expect(screen.getByText("Long")).toBeInTheDocument();
    expect(screen.getByText("Dropdown")).toBeInTheDocument();
    expect(screen.getByText("Radio")).toBeInTheDocument();
    expect(screen.getByText("Boolean")).toBeInTheDocument();
    expect(screen.getByText("Multi")).toBeInTheDocument();
    expect(screen.getByText("Swatch")).toBeInTheDocument();
    expect(screen.getByText(/Walnut/)).toBeInTheDocument();
    expect(screen.getByText("uploadFile")).toBeInTheDocument();
    expect(screen.getByText("Write clearly")).toBeInTheDocument();
  });

  it("reveals conditional fields and clears them when hidden", async () => {
    const user = userEvent.setup();
    const fields = [
      field({
        id: "gate",
        name: "Add engraving?",
        field_type: "boolean",
        position: 1,
      }),
      field({
        id: "text",
        name: "Engraving text",
        field_type: "short_text",
        position: 2,
        visible_when_field_id: "gate",
        visible_when_equals: "true",
      }),
    ];

    let answers: PersonalizationAnswers = {};
    const onChange = vi.fn((next: PersonalizationAnswers) => {
      answers = next;
      rerender(
        <ProductPersonalizationForm
          fields={fields}
          answers={answers}
          onChange={onChange}
        />,
      );
    });

    const { rerender } = render(
      <ProductPersonalizationForm
        fields={fields}
        answers={answers}
        onChange={onChange}
      />,
    );

    expect(screen.queryByText("Engraving text")).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByText("Engraving text")).toBeInTheDocument();
  });
});
