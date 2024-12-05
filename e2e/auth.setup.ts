import { test as setup } from "@playwright/test";
import { LoginPage } from "./pages/loginPage";
import { initAssets } from "./utils/BtfFile";

const authFile = "user.json";

export interface User {
  displayName: string;
}

setup("authenticate", async ({ page }) => {
  await initAssets();

  const loginPage = new LoginPage(page);
  await loginPage.visit();
  await loginPage.expectLoginPage();
  await loginPage.login();
  await loginPage.expectLoggedIn();

  await page.context().storageState({ path: authFile });
});
