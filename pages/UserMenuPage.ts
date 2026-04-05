import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

const preferencesUrl = /Special:Preferences/;

export class UserMenuPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private userMenuTrigger(): Locator {
    return this.page.locator('#vector-user-links-dropdown');
  }

  private preferencesLink(): Locator {
    return this.page
      .locator('#pt-preferences a[href*="Special:Preferences"]')
      .filter({ visible: true });
  }

  async openPreferencesFromUserMenu(): Promise<void> {
    await this.dismissCookieBannerIfPresent();
    await this.userMenuTrigger().click();

    const prefs = this.preferencesLink();
    await prefs.scrollIntoViewIfNeeded();
    await prefs.click();

    await expect(this.page).toHaveURL(preferencesUrl);
    await this.dismissCookieBannerIfPresent();
  }
}
