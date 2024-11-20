import { test } from "@playwright/test";
import { PagePaths } from "./utils/paths";

test("logout", async ({ page }) => {
  await page.goto(PagePaths.LOGOUT);
});
