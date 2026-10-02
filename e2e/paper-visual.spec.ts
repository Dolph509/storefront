import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";
import {
  SELLER_A_PRODUCT_PATH,
  SELLER_A_SHOP_PATH,
} from "./marketplace-fixtures";

// Real local catalog, no mocked commerce or synthetic product imagery.
// Before captures deliberately record existing defects without failing the sweep.
const stage = process.env.PAPER_VISUAL_STAGE || "after";
const artifactDir = `artifacts/paper-visual/${stage}`;

test("Paper migration responsive visual journey", async ({ page }) => {
  test.setTimeout(900_000);
  mkdirSync(artifactDir, { recursive: true });
  await page.goto("/us/en");
  const category = await page
    .locator('a[href*="/c/"]')
    .first()
    .getAttribute("href", { timeout: 2000 })
    .catch(() => null);
  const collection = await page
    .locator('a[href*="/collections/"]')
    .first()
    .getAttribute("href", { timeout: 2000 })
    .catch(() => null);
  const routes: [string, string][] = [
    ["products", "/us/en/products"],
    ["search", "/us/en/products?q=dev"],
    ["cart", "/us/en/cart"],
    ["shops", "/us/en/shops"],
    ["account", "/us/en/account"],
    ["pdp", SELLER_A_PRODUCT_PATH],
    ["seller", SELLER_A_SHOP_PATH],
    ["home", "/us/en"],
  ];
  if (category) routes.push(["category", category]);
  if (collection) routes.push(["collection", collection]);
  const widths = process.env.PAPER_VISUAL_WIDTHS
    ? process.env.PAPER_VISUAL_WIDTHS.split(",").map(Number)
    : stage === "before"
      ? [375, 1440]
      : [375, 768, 1280, 1440];
  const selectedRoutes = process.env.PAPER_VISUAL_ROUTES?.split(",");
  let consecutiveCaptureFailures = 0;
  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
    for (const [name, route] of routes) {
      if (selectedRoutes && !selectedRoutes.includes(name)) continue;
      if (
        stage === "before" &&
        ![
          "home",
          "products",
          "search",
          "pdp",
          "seller",
          "cart",
          "category",
          "collection",
        ].includes(name)
      )
        continue;
      try {
        const response = await page.goto(route, {
          waitUntil: "domcontentloaded",
          timeout: 35_000,
        });
        await expect(page.locator("main").first()).toBeVisible({
          timeout: 10_000,
        });
        await page.screenshot({
          path: `${artifactDir}/${width}-${name}.png`,
          fullPage: true,
          timeout: 30_000,
        });
        if (name === "products") {
          const card = page.locator(".theme-product-grid > :first-child");
          if (await card.count())
            await card.screenshot({ path: `${artifactDir}/${width}-card.png` });
        }
        if (stage !== "before") {
          expect.soft(response?.status(), route).toBeLessThan(400);
          expect
            .soft(
              await page.evaluate(
                () => document.documentElement.scrollWidth - innerWidth,
              ),
              `${width} ${route} overflow`,
            )
            .toBeLessThanOrEqual(1);
          expect
            .soft(
              await page.locator("a a, a button").count(),
              `${route} nested controls`,
            )
            .toBe(0);
        }
        consecutiveCaptureFailures = 0;
      } catch (error) {
        console.error(`${width} ${route}: ${String(error)}`);
        if (stage !== "before")
          expect.soft(false, `${width} ${route} failed to capture`).toBe(true);
        consecutiveCaptureFailures += 1;
        if (consecutiveCaptureFailures >= 3) throw error;
      }
    }
  }
});
