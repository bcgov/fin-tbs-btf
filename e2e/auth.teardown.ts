import { test } from "@playwright/test";
import { UploadPage } from "./pages/uploadPage";
import { LoginPage } from "./pages/loginPage";

test("logout", async ({ page }) => {
  const uploadPage = new UploadPage(page);
  await uploadPage.visit();
  await uploadPage.logout();
  const loginPage = new LoginPage(page);
  await loginPage.expectLoginPage(); //should be on login page
});
