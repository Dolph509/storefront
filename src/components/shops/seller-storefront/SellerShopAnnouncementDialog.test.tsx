import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SellerShopAnnouncementDialog } from "./SellerShopAnnouncementDialog";

describe("SellerShopAnnouncementDialog", () => {
  it("opens the full announcement in a modal and closes it", () => {
    render(
      <SellerShopAnnouncementDialog
        title="Announcement"
        content="<p>Full seller announcement</p>"
        canExpand
        readMoreLabel="Read more"
        closeLabel="Close"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Read more" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Full seller announcement")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not offer a modal for short announcements", () => {
    const { container } = render(
      <SellerShopAnnouncementDialog
        title="Announcement"
        content="<p>Short announcement</p>"
        canExpand={false}
        readMoreLabel="Read more"
        closeLabel="Close"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
