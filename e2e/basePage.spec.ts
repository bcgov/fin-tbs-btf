import { test } from "@playwright/test";
import { BasePage } from "./pages/basePage";

test.describe("basePage", () => {
  test("header should contain the username and logout button", async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await basePage.visit();
    await basePage.expectLoggedIn();
  });
});
