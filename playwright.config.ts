import { defineConfig, devices } from "@playwright/test";

const qaPort = Number(process.env.KUBO_QA_PORT ?? 3100);
const qaUrl = `http://127.0.0.1:${qaPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  use: { baseURL: qaUrl, trace: "retain-on-failure" },
  webServer: { command: "bun run qa:serve", url: qaUrl, reuseExistingServer: true, timeout: 120_000 },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
