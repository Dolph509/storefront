import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PersonalizationSnapshot } from "@/components/products/PersonalizationSnapshot";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("PersonalizationSnapshot", () => {
  it("renders historical snapshot labels", () => {
    render(
      <PersonalizationSnapshot
        snapshot={[
          { label: "Name to engrave", value: "Sarah" },
          { label: "Font", choice_labels: ["Modern"] },
        ]}
      />,
    );

    expect(screen.getByText("Name to engrave")).toBeInTheDocument();
    expect(screen.getByText("Sarah")).toBeInTheDocument();
    expect(screen.getByText("Font")).toBeInTheDocument();
    expect(screen.getByText("Modern")).toBeInTheDocument();
    expect(screen.queryByText("New Label")).not.toBeInTheDocument();
  });

  it("shows proof notice and authorized file links", () => {
    render(
      <PersonalizationSnapshot
        snapshot={[{ label: "Photo", attachment_signed_ids: ["sig"] }]}
        proofRequired
        files={[
          {
            id: "blob1",
            url: "/rails/active_storage/blobs/redirect/x/art.png",
            filename: "art.png",
            content_type: "image/png",
          },
        ]}
      />,
    );

    expect(screen.getByText("proofRequiredShort")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "art.png" })).toHaveAttribute(
      "href",
      "/rails/active_storage/blobs/redirect/x/art.png",
    );
  });
});
