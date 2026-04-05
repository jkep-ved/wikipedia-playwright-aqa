import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

const selLanguage = 'select[name="wplanguage"]';
const selProfileTab = 'a[href="#mw-prefsection-personal"]';

export class PreferencesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private preferencesForm(): Locator {
    return this.page.locator('form').filter({ has: this.page.locator(selLanguage) });
  }

  private languageSelect(): Locator {
    return this.preferencesForm().locator(selLanguage);
  }

  private saveButton(): Locator {
    return this.preferencesForm().locator('button[type="submit"]');
  }

  private profileTab(): Locator {
    return this.page.locator(selProfileTab);
  }

  async openUserProfileTabIfVisible(): Promise<void> {
    const tab = this.profileTab();
    if (await tab.isVisible()) {
      await tab.click();
    }
  }

  async selectDifferentInterfaceLanguage(): Promise<string> {
    const select = this.languageSelect();

    const alternate = await select.evaluate((el: HTMLSelectElement) => {
      const values = [...el.options].map((o) => o.value).filter(Boolean);
      return values.find((v) => v !== el.value) ?? null;
    });

    if (!alternate) {
      throw new Error('У списку мов немає варіанту, відмінного від поточного');
    }

    await select.selectOption(alternate, { force: true });
    return alternate;
  }

  async savePreferences(): Promise<void> {
    await this.saveButton().click();
  }

  async expectSelectedLanguage(code: string): Promise<void> {
    await expect(this.languageSelect()).toHaveValue(code);
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }
}
