import type { OrderProof } from "@spree/sdk";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { OrderProofPanel } from "@/components/order/OrderProofPanel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const approveMock = vi.fn();
const requestMock = vi.fn();

vi.mock("@/lib/data/order-proofs", () => ({
  approveOrderProof: (...args: unknown[]) => approveMock(...args),
  requestOrderProofChanges: (...args: unknown[]) => requestMock(...args),
}));

const messages = {
  orderProofs: {
    title: "Proof approval",
    awaitingSeller: "Proof required. The seller is preparing your proof.",
    ready: "Proof #{version} is ready",
    sellerNote: "Seller:",
    approve: "Approve proof",
    requestChanges: "Request changes",
    changesRequested: "Proof #{version} — changes requested",
    yourRequest: "Your request:",
    sellerRevising: "The seller is preparing a revision.",
    approved: "Proof #{version} approved",
    approvedOn: "Approved on {date}",
    history: "Proof history",
    historyItem: "Proof #{version} — {status}",
    approveConfirmTitle: "Approve this proof?",
    approveConfirmBody:
      "By approving, you confirm the personalization shown is correct.",
    approveConfirm: "Approve",
    requestTitle: "Request changes",
    requestHelp: "What should the seller change?",
    requestPlaceholder: "Describe the changes you need",
    sendRequest: "Send request",
    cancel: "Cancel",
    statuses: {
      submitted: "Awaiting your approval",
      changes_requested: "Changes requested",
      approved: "Approved",
      superseded: "Superseded",
      cancelled: "Cancelled",
    },
    errors: {
      approveFailed: "Could not approve this proof. Please try again.",
      requestFailed: "Could not send your change request. Please try again.",
      responseRequired: "Please describe what should change.",
    },
  },
};

function proof(overrides: Partial<OrderProof> = {}): OrderProof {
  return {
    id: "opf_1",
    version: 1,
    status: "submitted",
    seller_note: "Please verify spelling and layout.",
    buyer_response: null,
    order_id: "ord_1",
    line_item_id: "li_1",
    seller_id: "sel_1",
    responded_at: null,
    created_at: "2026-09-20T00:00:00Z",
    images: [
      {
        id: "blob_1",
        url: "/rails/active_storage/blobs/proof.png",
        filename: "proof.png",
        content_type: "image/png",
      },
    ],
    ...overrides,
  };
}

function renderPanel(proofs: OrderProof[], proofRequired = true) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <OrderProofPanel
        orderId="ord_1"
        lineItemId="li_1"
        proofRequired={proofRequired}
        proofs={proofs}
      />
    </NextIntlClientProvider>,
  );
}

describe("OrderProofPanel", () => {
  it("shows awaiting seller when proof required and none submitted", () => {
    renderPanel([]);
    expect(
      screen.getByText(/seller is preparing your proof/i),
    ).toBeInTheDocument();
  });

  it("shows submitted proof image and actions", () => {
    renderPanel([proof()]);
    expect(screen.getByText(/Proof #1 is ready/i)).toBeInTheDocument();
    expect(screen.getByAltText("proof.png")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /approve proof/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /request changes/i }),
    ).toBeInTheDocument();
  });

  it("requires confirmation before approve", async () => {
    const user = userEvent.setup();
    approveMock.mockResolvedValue(proof({ status: "approved" }));
    renderPanel([proof()]);
    await user.click(screen.getByRole("button", { name: /approve proof/i }));
    expect(screen.getByText(/Approve this proof/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Approve$/i }));
    expect(approveMock).toHaveBeenCalledWith("ord_1", "opf_1");
  });

  it("requires buyer response for request changes", async () => {
    const user = userEvent.setup();
    renderPanel([proof()]);
    await user.click(screen.getByRole("button", { name: /request changes/i }));
    await user.click(screen.getByRole("button", { name: /send request/i }));
    expect(
      screen.getByText(/describe what should change/i),
    ).toBeInTheDocument();
    expect(requestMock).not.toHaveBeenCalled();
  });

  it("submits change request with feedback", async () => {
    const user = userEvent.setup();
    requestMock.mockResolvedValue(proof({ status: "changes_requested" }));
    renderPanel([proof()]);
    await user.click(screen.getByRole("button", { name: /request changes/i }));
    await user.type(
      screen.getByPlaceholderText(/describe the changes/i),
      "Please make the text larger.",
    );
    await user.click(screen.getByRole("button", { name: /send request/i }));
    expect(requestMock).toHaveBeenCalledWith(
      "ord_1",
      "opf_1",
      "Please make the text larger.",
    );
  });

  it("shows approved state", () => {
    renderPanel([
      proof({
        status: "approved",
        version: 2,
        responded_at: "2026-09-20T12:00:00Z",
      }),
    ]);
    expect(screen.getByText(/Proof #2 approved/i)).toBeInTheDocument();
  });

  it("renders nothing when proof is not required", () => {
    const { container } = renderPanel([], false);
    expect(container).toBeEmptyDOMElement();
  });
});
