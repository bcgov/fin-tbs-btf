import { test as setup } from "@playwright/test";
import { LoginPage } from "./pages/login";
import { PagePaths } from "./utils/paths";
import { BasePage } from "./pages/basePage";

const authFile = "user.json";

export interface User {
  displayName: string;
}

setup("authenticate", async ({ page }) => {
  await page.goto(PagePaths.LOGIN);
  const loginPage = new LoginPage(page);
  await loginPage.setup();
  await loginPage.login();

  const basePage = new BasePage(loginPage.page);
  await basePage.setup();
  await basePage.verifyUserIsDisplayed();

  await page.context().storageState({ path: authFile });
});
