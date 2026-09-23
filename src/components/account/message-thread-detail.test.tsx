import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MessageThreadDetail } from "./MessageThreadDetail";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/data/communication-blocks", () => ({
  blockSeller: vi.fn(),
  unblockSeller: vi.fn(),
}));

vi.mock("@/lib/data/messages", () => ({
  markMessageThreadRead: vi.fn(),
  sendMessageThreadReply: vi.fn(),
  uploadMessageImage: vi.fn(),
}));

describe("MessageThreadDetail", () => {
  it("renders HTML-like message bodies as plain text", () => {
    const thread = {
      id: "msgth_test",
      subject_type: "general",
      writable: true,
      seller_name: "Shop",
      communication_block_id: null,
    } as const;

    const messages = [
      {
        id: "msg_1",
        sender_type: "seller",
        body: '<script>alert(1)</script>Hello <a href="https://evil.example">link</a>',
        created_at: new Date().toISOString(),
        images: [],
      },
    ] as const;

    const { container } = render(
      <MessageThreadDetail
        thread={thread}
        messages={[...messages]}
        basePath=""
      />,
    );

    const body = screen.getByText(/<script>alert\(1\)<\/script>/);
    expect(body.tagName).toBe("P");
    expect(container.querySelector("script")).toBeNull();
    expect(body.querySelector("a")).toBeNull();
  });

  it("shows messaging unavailable when the thread is not writable", () => {
    const thread = {
      id: "msgth_blocked",
      subject_type: "general",
      writable: false,
      seller_name: "Shop",
      communication_block_id: "mcb_1",
    } as const;

    render(<MessageThreadDetail thread={thread} messages={[]} basePath="" />);

    expect(screen.getByText("messagingUnavailable")).toBeInTheDocument();
  });
});
