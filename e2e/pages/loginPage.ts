import { authenticator } from "otplib";
import { PagePaths } from "../utils/paths";
import { BasePage } from "./basePage";
import { expect, Locator, Page } from "@playwright/test";

export class LoginPage extends BasePage {
  loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.loginButton = this.page.getByRole("button", {
      name: "Login with IDIR MFA",
    });
  }

  /** Navigate to the login page */
  async visit() {
    await this.page.goto(PagePaths.LOGIN);
  }
  async login() {
    await this.loginButton.click();
    await this.page.getByLabel("Enter your email, phone, or").click();
    await this.page
      .getByPlaceholder("Email, phone, or Skype")
      .fill(process.env.E2E_AUTO_TEST_USER_NAME!);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.getByPlaceholder("Password").click();
    await this.page
      .getByPlaceholder("Password")
      .fill(process.env.E2E_AUTO_TEST_PASSWORD!);
    await this.page.getByRole("button", { name: "Sign in" }).click();

    const otpToken = authenticator.generate(
      process.env.E2E_AUTO_TEST_OTP_SECRET!,
    );
    await this.page.getByPlaceholder("Code").click();
    await this.page.getByPlaceholder("Code").fill(otpToken);
    await this.page.getByRole("button", { name: "Verify" }).click();
    await this.page.getByText("Don't show this again").click();
    await this.page.getByRole("button", { name: "Yes" }).click();
  }

  //////////
  // EXPECT
  //////////

  async expectLoginPage() {
    await expect(this.loginButton).toBeVisible();
  }
}
