import { test } from "@playwright/test";
import { BasePage } from "./pages/basePage";

test.describe("basePage", () => {
  test("header", async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.visit();
    await basePage.expectLoggedIn();
  });
});
