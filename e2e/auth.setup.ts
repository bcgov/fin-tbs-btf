import { test as setup } from "@playwright/test";
import { LoginPage } from "./pages/loginPage";

const authFile = "user.json";

export interface User {
  displayName: string;
}

setup("authenticate", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.visit();
  await loginPage.expectLoginPage();
  await loginPage.login();
  await loginPage.expectUserName();

  await page.context().storageState({ path: authFile });
});
