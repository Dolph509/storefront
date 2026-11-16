import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RequestCustomOrderForm } from "./RequestCustomOrderForm";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  createObjectURL: vi.fn(() => "blob:reference-1"),
  isAuthenticated: true,
  loading: false,
  push: vi.fn(),
  revokeObjectURL: vi.fn(),
  upload: vi.fn(),
}));

const NativeURL = globalThis.URL;

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
  useAuth: () => ({
    isAuthenticated: mocks.isAuthenticated,
    loading: mocks.loading,
  }),
}));

vi.mock("@/lib/data/sellers", () => ({
  createCustomOrderRequest: mocks.create,
  uploadCustomOrderAttachment: mocks.upload,
}));

describe("RequestCustomOrderForm", () => {
  beforeEach(() => {
    mocks.isAuthenticated = true;
    mocks.loading = false;
    mocks.createObjectURL.mockClear();
    mocks.revokeObjectURL.mockClear();
    mocks.create.mockReset();
    mocks.push.mockReset();
    mocks.upload.mockReset();
    vi.stubGlobal(
      "URL",
      Object.assign(class extends NativeURL {}, {
        createObjectURL: mocks.createObjectURL,
        revokeObjectURL: mocks.revokeObjectURL,
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires sign-in before showing the request form and returns to the shop", () => {
    mocks.isAuthenticated = false;

    render(
      <RequestCustomOrderForm
        sellerId="sel_123"
        basePath="/us/en"
        returnTo="/us/en/sellers/oak-studio?tab=custom-orders"
        initialOpen
      />,
    );

    expect(screen.queryByPlaceholderText("descriptionPlaceholder")).toBeNull();
    expect(screen.getByRole("link", { name: /signInButton/ })).toHaveAttribute(
      "href",
      "/us/en/account?redirect=%2Fus%2Fen%2Fsellers%2Foak-studio%3Ftab%3Dcustom-orders",
    );
  });

  it("waits for the buyer session before choosing a form state", () => {
    mocks.loading = true;

    const { container } = render(
      <RequestCustomOrderForm
        sellerId="sel_123"
        basePath="/us/en"
        initialOpen
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the form immediately when the buyer is already signed in", () => {
    render(
      <RequestCustomOrderForm
        sellerId="sel_123"
        basePath="/us/en"
        initialOpen
      />,
    );

    expect(
      screen.getByPlaceholderText("descriptionPlaceholder"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "requestButton" })).toBeNull();
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
    fireEvent.change(
      screen.getByLabelText("attachmentsLabel", { selector: "input" }),
      {
        target: { files: [image] },
      },
    );
    expect(
      screen.getByRole("img", { name: "reference.png" }),
    ).toBeInTheDocument();
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

  it("previews a selected image and lets the buyer remove it", async () => {
    const user = userEvent.setup();
    const image = new File(["image"], "reference.png", {
      type: "image/png",
    });

    render(
      <RequestCustomOrderForm
        sellerId="sel_123"
        basePath="/us/en"
        initialOpen
      />,
    );

    fireEvent.change(
      screen.getByLabelText("attachmentsLabel", { selector: "input" }),
      {
        target: { files: [image] },
      },
    );

    expect(
      await screen.findByRole("img", { name: "reference.png" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "removeAttachment" }));

    expect(screen.queryByRole("img", { name: "reference.png" })).toBeNull();
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:reference-1");
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
