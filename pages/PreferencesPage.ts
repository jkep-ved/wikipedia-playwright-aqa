import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

const idLanguageWidget = '#mw-input-wplanguage';
const cssLanguageSelect = 'select[name="wplanguage"]';
const cssUserProfileTab = 'a[href="#mw-prefsection-personal"]';
const reInternationalisationHeading =
  /інтернаціоналізація|internationalisation|internationalization|internazionalizzazione|интернационализация|internationalisierung/i;
const ms = { languageReady: 20_000 } as const;

export class PreferencesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private mainPreferencesForm(): Locator {
    return this.page.locator('form').filter({
      has: this.page.locator(`${idLanguageWidget}, ${cssLanguageSelect}`)
    });
  }

  private languageSelect(): Locator {
    return this.mainPreferencesForm().locator(cssLanguageSelect);
  }

  private saveButton(): Locator {
    return this.mainPreferencesForm().locator('button[type="submit"]');
  }

  private userProfileTab(): Locator {
    return this.page.locator(cssUserProfileTab);
  }

  async scrollInternationalisationSectionIntoView(): Promise<void> {
    const heading = this.mainPreferencesForm().getByRole('heading', {
      name: reInternationalisationHeading
    });
    if ((await heading.count()) > 0) {
      await heading.scrollIntoViewIfNeeded();
      return;
    }
    await this.languageSelect().evaluate((el) => el.scrollIntoView({ block: 'nearest' }));
  }

  async getCurrentInterfaceLanguageCode(): Promise<string> {
    return this.languageSelect().inputValue();
  }

  async openUserProfileTabIfVisible(): Promise<void> {
    const tab = this.userProfileTab();
    if (await tab.isVisible()) {
      await tab.click();
    }
  }

  async expectLanguageSelectReady(): Promise<void> {
    await expect(this.languageSelect()).toBeAttached({ timeout: ms.languageReady });
  }

  async selectDifferentInterfaceLanguage(preferred: string | undefined): Promise<string> {
    const select = this.languageSelect();
    const current = await select.inputValue();

    if (preferred && preferred !== current) {
      await select.selectOption(preferred, { force: true });
      return preferred;
    }

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
    const save = this.saveButton();
    await save.scrollIntoViewIfNeeded();
    await save.click();
  }

  async expectSelectedLanguage(code: string): Promise<void> {
    await expect(this.languageSelect()).toHaveValue(code, { timeout: ms.languageReady });
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }
}
