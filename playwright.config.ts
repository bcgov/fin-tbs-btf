import { defineConfig, devices } from "@playwright/test";
import { PagePaths } from "./e2e/utils/paths";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/utils/globalSetup.ts",
  timeout: 60 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["line"],
    ["list", { printSteps: true }],
    ["html", { open: "always" }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: PagePaths.BASE,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "teardown",
      testMatch: /.*\.teardown\.ts/,
      use: {
        storageState: "user.json",
      },
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: PagePaths.BASE,
        storageState: "user.json",
      },
      dependencies: ["setup"],
      teardown: "teardown",
    },
    {
      name: "Google Chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        baseURL: PagePaths.BASE,
        storageState: "user.json",
      },
      dependencies: ["setup"],
      teardown: "teardown",
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        baseURL: PagePaths.BASE,
        storageState: "user.json",
      },
      dependencies: ["setup"],
      teardown: "teardown",
    },

    {
      name: "safari",
      use: {
        ...devices["Desktop Safari"],
        baseURL: PagePaths.BASE,
        storageState: "user.json",
      },
      dependencies: ["setup"],
      teardown: "teardown",
    },
    {
      name: "Microsoft Edge",
      use: {
        ...devices["Desktop Edge"],
        channel: "msedge",
        baseURL: PagePaths.BASE,
        storageState: "user.json",
      },
      dependencies: ["setup"],
      teardown: "teardown",
    },
  ],
});
