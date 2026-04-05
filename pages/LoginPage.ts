import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

const selUsername = '#wpName1';
const selPassword = '#wpPassword1';
const selSubmit = '#wpLoginAttempt';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private usernameInput(): Locator {
    return this.page.locator(selUsername);
  }

  private passwordInput(): Locator {
    return this.page.locator(selPassword);
  }

  private submitButton(): Locator {
    return this.page.locator(selSubmit);
  }

  private vectorInterfaceLoginLink(): Locator {
    return this.page.locator('a[data-mw-interface][href*="Special:UserLogin"]');
  }

  private portletLoginLink(): Locator {
    return this.page.locator('#pt-login a[href*="Special:UserLogin"]');
  }

  async openLoginFormFromHeader(): Promise<void> {
    await this.dismissCookieBannerIfPresent();

    const vectorLink = this.vectorInterfaceLoginLink();
    if ((await vectorLink.count()) > 0) {
      await vectorLink.first().click();
    } else {
      await this.portletLoginLink().click({ force: true });
    }
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
