import { Page, expect } from "@playwright/test";
import { PagePaths } from "../utils/paths";

export class BasePage {
  constructor(public readonly page: Page) {}

  async setup() {}

  async verifyUserIsDisplayed() {
    await expect(this.page.getByTestId("account-info")).toContainText("TBS");
  }
  async logout() {
    await this.page.getByRole("button", { name: "Logout" }).click();
    await this.page
      .locator(`[data-test-id="${process.env.E2E_AUTO_TEST_USER_NAME}"]`)
      .click();
  }
}
