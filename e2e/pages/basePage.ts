import { Locator, Page, expect } from "@playwright/test";
import { PagePaths } from "../utils/paths";

export class BasePage {
  logoutButton: Locator;
  loginButton: Locator;
  userName: Locator;
  constructor(public readonly page: Page) {
    this.logoutButton = this.page.getByRole("button", {
      name: "Logout",
    });
    this.loginButton = this.page.getByRole("button", {
      name: "Login with IDIR MFA",
    });
    this.userName = this.page.getByTestId("account-info");
  }

  /** Navigate to the base page */
  async visit() {
    await this.page.goto(PagePaths.BASE);
  }

  async logout() {
    await this.logoutButton.click();
    await this.page
      .locator(`[data-test-id="${process.env.E2E_AUTO_TEST_EMAIL}"]`)
      .click();
    this.loginButton.waitFor(); // have to wait for the logout to complete or it is cancelled.
  }

  async isLoggedIn() {
    return this.logoutButton.isVisible();
  }

  //////////
  // EXPECT
  //////////

  /** Expect the name and logout button to be shown */
  async expectLoggedIn() {
    await expect(this.userName).toContainText("TBS");
    await expect(this.logoutButton).toBeVisible();
  }
}
