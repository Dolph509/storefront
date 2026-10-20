import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ browserEvidence: undefined }>({
  browserEvidence: [
    async ({ page }, use, testInfo) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const requests: {
        method: string;
        url: string;
        status?: number;
        durationMs?: number;
        failure?: string;
      }[] = [];
      const safeUrl = (url: string) => {
        const parsed = new URL(url);
        return `${parsed.origin}${parsed.pathname}`;
      };
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfinished", (request) => {
        const timing = request.timing();
        requests.push({
          method: request.method(),
          url: safeUrl(request.url()),
          durationMs: Math.round(timing.responseEnd),
        });
      });
      page.on("response", (response) => {
        if (response.status() >= 400)
          requests.push({
            method: response.request().method(),
            url: safeUrl(response.url()),
            status: response.status(),
          });
      });
      page.on("requestfailed", (request) =>
        requests.push({
          method: request.method(),
          url: safeUrl(request.url()),
          failure: request.failure()?.errorText,
        }),
      );
      await use(undefined);
      await testInfo.attach("browser-evidence", {
        body: JSON.stringify({ consoleErrors, pageErrors, requests }, null, 2),
        contentType: "application/json",
      });
    },
    { auto: true },
  ],
});

export { expect };
