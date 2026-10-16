// Playwright — e2e pentru dashboard-ul admin (mod DEMO, fără backend real).
// Playwright — e2e for the admin dashboard (DEMO mode, no real backend).
const { defineConfig, devices } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 8000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
