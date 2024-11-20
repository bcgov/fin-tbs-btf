import { Page, expect } from "@playwright/test";
import { PagePaths } from "../utils/paths";

export class BasePage {
  constructor(public readonly page: Page) {}

  async setup() {}

  async verifyUserIsDisplayed() {
    await expect(this.page.getByTestId("account-info")).not.toBeEmpty();
  }
  async logout() {
    await this.page.getByRole("button", { name: "Logout" }).click();
    await this.page.waitForTimeout(1000);
    await this.page.waitForURL(PagePaths.LOGIN);
  }
}
