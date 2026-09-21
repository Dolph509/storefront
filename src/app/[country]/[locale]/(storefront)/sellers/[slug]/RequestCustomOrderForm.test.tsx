import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequestCustomOrderForm } from "./RequestCustomOrderForm";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  push: vi.fn(),
  upload: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@/lib/data/sellers", () => ({
  createCustomOrderRequest: mocks.create,
  uploadCustomOrderAttachment: mocks.upload,
}));

describe("RequestCustomOrderForm", () => {
  beforeEach(() => {
    mocks.create.mockReset();
    mocks.push.mockReset();
    mocks.upload.mockReset();
  });

  it("uploads reference images and navigates to the created request", async () => {
    const user = userEvent.setup();
    const image = new File(["image"], "reference.png", {
      type: "image/png",
    });
    mocks.upload.mockResolvedValue({ signedId: "signed-blob" });
    mocks.create.mockResolvedValue({ id: "cor_123" });

    render(<RequestCustomOrderForm sellerId="sel_123" basePath="/us/en" />);

    await user.click(screen.getByRole("button", { name: "requestButton" }));
    await user.type(
      screen.getByPlaceholderText("descriptionPlaceholder"),
      "Make this in blue",
    );
    fireEvent.change(screen.getByLabelText("attachmentsLabel"), {
      target: { files: [image] },
    });
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mocks.upload).toHaveBeenCalledOnce();
      expect(mocks.create).toHaveBeenCalledWith("sel_123", {
        description: "Make this in blue",
        wanted_by_on: undefined,
        source_product_id: undefined,
        attachments: ["signed-blob"],
      });
      expect(mocks.push).toHaveBeenCalledWith(
        "/us/en/account/custom-orders/cor_123",
      );
    });
  });

  it("passes the source product when requesting a custom version", async () => {
    const user = userEvent.setup();
    mocks.create.mockResolvedValue({ id: "cor_456" });

    render(
      <RequestCustomOrderForm
        sellerId="sel_123"
        basePath="/us/en"
        sourceProductId="prod_abc"
        sourceProductName="Blue vase"
        ctaLabel="requestCustomVersion"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "requestCustomVersion" }),
    );
    expect(screen.getByText("Blue vase")).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText("descriptionPlaceholder"),
      "Larger version",
    );
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith("sel_123", {
        description: "Larger version",
        wanted_by_on: undefined,
        source_product_id: "prod_abc",
        attachments: [],
      });
    });
  });
});
