import type { Category } from "@spree/sdk";
import { describe, expect, it } from "vitest";
import { buildCategoryNavigationTree } from "@/lib/data/category-navigation-tree";

function category(
  id: string,
  parent_id: string | null,
  position: number,
  name = id,
): Category {
  return {
    id,
    parent_id,
    position,
    name,
    permalink: id.toLowerCase(),
    depth: parent_id ? 1 : 0,
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    children_count: 0,
    description: "",
    description_html: "",
    image_url: null,
    square_image_url: null,
    is_root: !parent_id,
    is_child: Boolean(parent_id),
    is_leaf: true,
  };
}

describe("buildCategoryNavigationTree", () => {
  it("reconstructs arbitrary hierarchy depth and preserves category ordering", () => {
    const tree = buildCategoryNavigationTree([
      category("later", null, 2),
      category("leaf", "child", 1),
      category("child", "root", 1),
      category("root", null, 1),
      category("first-child", "root", 0),
    ]);

    expect(tree.map((node) => node.id)).toEqual(["root", "later"]);
    expect(tree[0].children?.map((node) => node.id)).toEqual([
      "first-child",
      "child",
    ]);
    expect(tree[0].children?.[1].children?.[0].id).toBe("leaf");
  });

  it("keeps children visible as roots when their parent is not published", () => {
    const tree = buildCategoryNavigationTree([
      category("visible", "hidden", 0),
    ]);
    expect(tree.map((node) => node.id)).toEqual(["visible"]);
  });
});
