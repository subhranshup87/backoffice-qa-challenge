import { defineConfig, devices } from "@playwright/test";

// Defaults to the port `pnpm dev` uses, so an already-running development server
// is reused. Set PORT to move the suite elsewhere.
const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    viewport: { width: 1440, height: 900 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
