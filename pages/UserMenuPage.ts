import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { WikiCss, WikiRegex, WikiUrlPatterns } from './locators';

/**
 * Кроки 3–4 тест-кейсу: меню облікового запису → Special:Preferences.
 */
export class UserMenuPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private personalToolsToggleByName(): Locator {
    return this.page.getByRole('button', { name: WikiRegex.personalToolsToggle });
  }

  private async tryOpenVectorDropdowns(): Promise<boolean> {
    const vectorBtn = this.page.locator('#vector-user-links-dropdown');
    if (await this.isVisibleWithin(vectorBtn, 3000)) {
      await vectorBtn.click();
      return true;
    }

    const menuLabel = this.page.locator('label[for="vector-user-links-dropdown-checkbox"]');
    if (await this.isVisibleWithin(menuLabel, 2000)) {
      await menuLabel.click();
      return true;
    }

    const checkbox = this.page.locator('#vector-user-links-dropdown-checkbox');
    if (await this.isVisibleWithin(checkbox, 2000)) {
      await checkbox.click({ force: true });
      return true;
    }

    return false;
  }

  private async tryOpenFromNavigationLandmark(): Promise<boolean> {
    const nav = this.page.getByRole('navigation', { name: WikiRegex.personalNavigationLandmark });
    const menuButton = nav.getByRole('button', { name: WikiRegex.personalToolsButtonInNav });
    if ((await menuButton.count()) === 0) {
      return false;
    }
    if (await this.isVisibleWithin(menuButton.first(), 3000)) {
      await menuButton.first().click();
      return true;
    }
    return false;
  }

  async openPersonalToolsMenu(): Promise<void> {
    try {
      await this.personalToolsToggleByName().first().click({ timeout: 6000 });
      return;
    } catch {
      /* інші варіанти нижче */
    }

    if (await this.tryOpenVectorDropdowns()) {
      return;
    }

    if (await this.tryOpenFromNavigationLandmark()) {
      return;
    }

    const directBar = this.page.locator('#pt-preferences a[href*="Special:Preferences"]');
    if (await this.isVisibleWithin(directBar, 2000)) {
      return;
    }

    throw new Error('Не вдалося відкрити меню облікового запису (personal tools)');
  }

  private preferencesRootLink(): Locator {
    return this.page.locator(WikiCss.preferencesRootLink).first();
  }

  async openPreferencesFromUserMenu(): Promise<void> {
    await this.openPersonalToolsMenu();

    const prefsLink = this.preferencesRootLink();
    await expect(prefsLink).toBeAttached({ timeout: 10_000 });
    await prefsLink.click({ force: true });

    await expect(this.page).toHaveURL(WikiUrlPatterns.preferences, { timeout: 20_000 });
    await this.dismissCookieBannerIfPresent();
  }
}
