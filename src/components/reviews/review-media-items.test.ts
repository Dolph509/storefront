import { describe, expect, it } from "vitest";
import { flattenReviewMedia } from "./review-media-items";

describe("flattenReviewMedia", () => {
  it("orders images before videos and tags kinds", () => {
    const items = flattenReviewMedia(
      [
        {
          id: "img_1",
          url: "/a.jpg",
          filename: "a.jpg",
          content_type: "image/jpeg",
        },
      ],
      [
        {
          id: "vid_1",
          url: "/a.mp4",
          filename: "a.mp4",
          content_type: "video/mp4",
        },
      ],
    );
    expect(items).toEqual([
      {
        id: "img_1",
        url: "/a.jpg",
        filename: "a.jpg",
        content_type: "image/jpeg",
        kind: "image",
      },
      {
        id: "vid_1",
        url: "/a.mp4",
        filename: "a.mp4",
        content_type: "video/mp4",
        kind: "video",
      },
    ]);
  });
});
