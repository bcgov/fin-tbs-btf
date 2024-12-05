import { test } from "@playwright/test";
import { BasePage } from "./pages/basePage";
import { baseURL } from "./utils/paths";

test.describe("basePage", () => {
  test("header", async ({ page }) => {
    await page.goto(baseURL);
    const basePage = new BasePage(page);
    await basePage.expectLoggedIn();
  });
});
