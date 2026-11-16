import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const report = JSON.parse(readFileSync("test-results/buyer-desktop-report.json", "utf8"));
const evidencePath = "../docs/evidence/marketplace-beta/buyer-browser-verification-20261018.json";
const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
const tests = [];
function visit(suite) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const result = test.results.at(-1);
      const diagnostics = result.attachments.find((attachment) => attachment.name === "browser-evidence");
      const browser = diagnostics?.body
        ? JSON.parse(Buffer.from(diagnostics.body, "base64").toString("utf8"))
        : null;
      tests.push({ title: spec.title, file: spec.file, status: result.status,
        durationMs: result.duration, errors: result.errors.map((error) => error.message),
        screenshots: result.attachments.filter((attachment) => attachment.contentType === "image/png").map((attachment) => attachment.path),
        browser });
    }
  }
  for (const child of suite.suites || []) visit(child);
}
for (const suite of report.suites) visit(suite);
const screenshotDirectory = "test-results/buyer-desktop-20261019-clean";
function listScreenshots(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listScreenshots(path);
    return entry.isFile() && entry.name.endsWith(".png")
      ? [relative(".", path).replaceAll("\\", "/")]
      : [];
  });
}
const browserDiagnostics = tests.reduce(
  (totals, test) => {
    const requests = test.browser?.requests || [];
    totals.pageErrors += test.browser?.pageErrors?.length || 0;
    totals.consoleErrors += test.browser?.consoleErrors?.length || 0;
    totals.httpErrors += requests.filter((request) => request.status >= 400).length;
    totals.navigationAborts += requests.filter(
      (request) => request.failure === "net::ERR_ABORTED",
    ).length;
    totals.otherRequestFailures += requests.filter(
      (request) => request.failure && request.failure !== "net::ERR_ABORTED",
    ).length;
    return totals;
  },
  {
    pageErrors: 0,
    consoleErrors: 0,
    httpErrors: 0,
    navigationAborts: 0,
    otherRequestFailures: 0,
  },
);
evidence.desktop_closure = {
  captured_at: new Date().toISOString(), storefront: "http://localhost:3302/us/en",
  api: "http://127.0.0.1:3011", database: "spree_beta_financial_20261016",
  mode: "fresh isolated Next.js webpack development process; production build not used because the current storefront build has existing TypeScript errors",
  stats: report.stats, tests,
  root_cause: "Locale middleware rewrote spree_country and spree_locale cookies on every response, including Server Action POSTs. That caused repeated RSC refreshes and stale navigation responses. The E2E dev-overlay init script also observed document.documentElement before it existed.",
  fixes: [
    "Write locale cookies only when their values differ from the canonical URL context.",
    "Wait for document.documentElement before attaching the dev-overlay MutationObserver.",
  ],
  browser_diagnostics: browserDiagnostics,
  screenshots: listScreenshots(screenshotDirectory),
  api_timings: JSON.parse(readFileSync("test-results/buyer-api-timings.json", "utf8")),
  report: "storefront/test-results/buyer-desktop-report.json",
  screenshots_directory: `storefront/${screenshotDirectory}`,
  scope: "Five desktop buyer checks in BETA_BUYER_DESKTOP_SPECS; excludes transaction-creating and unrelated merchandising suites",
  safety: "No Stripe charges/refunds, no shared database changes, no historical queue execution",
};
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ stats: report.stats, tests: tests.map(({ title, status, durationMs, browser }) => ({ title, status, durationMs,
  pageErrors: browser?.pageErrors, consoleErrors: browser?.consoleErrors,
  failedRequests: browser?.requests.filter((request) => request.failure || request.status >= 400) })) }));
