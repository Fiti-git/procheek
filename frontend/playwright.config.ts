import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [
    ["html", { outputFolder: "../project_doc/playwright-report", open: "never" }],
    ["list"],
  ],
  // The e2e-journeys.spec.ts file opts into `video: "on"` via test.use({ video: "on" })
  // to capture full journey recordings. Everything else stays on retain-on-failure.
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
