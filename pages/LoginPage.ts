import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

const idUsername = '#wpName1';
const idPassword = '#wpPassword1';
const idSubmit = '#wpLoginAttempt';
const ms = { loginForm: 15_000, loginHidden: 30_000 } as const;

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private usernameInput(): Locator {
    return this.page.locator(idUsername);
  }

  private passwordInput(): Locator {
    return this.page.locator(idPassword);
  }

  private submitButton(): Locator {
    return this.page.locator(idSubmit);
  }

  private vectorInterfaceLoginLink(): Locator {
    return this.page.locator('a[data-mw-interface][href*="Special:UserLogin"]');
  }

  private portletLoginLink(): Locator {
    return this.page.locator('#pt-login a[href*="Special:UserLogin"]');
  }

  async openLoginFormFromHeader(): Promise<void> {
    const vectorLink = this.vectorInterfaceLoginLink();
    if ((await vectorLink.count()) > 0) {
      await expect(vectorLink).toBeVisible({ timeout: ms.loginForm });
      await vectorLink.click();
    } else {
      const portlet = this.portletLoginLink();
      await expect(portlet).toBeAttached({ timeout: ms.loginForm });
      await portlet.click({ force: true });
    }

    await expect(this.usernameInput()).toBeVisible({ timeout: ms.loginForm });
    await this.dismissCookieBannerIfPresent();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }

  async expectLoginSuccessful(): Promise<void> {
    await expect(this.usernameInput()).toBeHidden({ timeout: ms.loginHidden });
  }
}
