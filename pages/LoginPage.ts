import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { WikiCss, WikiIds, WikiPaths } from './locators';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private usernameInput() {
    return this.page.locator(WikiIds.loginUsername);
  }

  private passwordInput() {
    return this.page.locator(WikiIds.loginPassword);
  }

  private submitButton() {
    return this.page.locator(WikiIds.loginSubmit);
  }

  /** Прямий перехід (допоміжно; у сценарії тест-кейсу — вхід через шапку). */
  async open(): Promise<void> {
    await this.page.goto(WikiPaths.login);
    await this.dismissCookieBannerIfPresent();
  }

  /** Крок 2: з головної відкрити форму входу посиланням у шапці. */
  async openLoginFormFromHeader(): Promise<void> {
    const loginLink = this.page.locator(WikiCss.loginFromSiteLink).first();
    await expect(loginLink).toBeVisible({ timeout: 15_000 });
    await loginLink.click();
    await expect(this.usernameInput()).toBeVisible({ timeout: 15_000 });
    await this.dismissCookieBannerIfPresent();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }

  async expectLoginSuccessful(): Promise<void> {
    await expect(this.usernameInput()).toBeHidden({ timeout: 30_000 });
  }
}
