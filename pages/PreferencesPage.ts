import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { WikiCss, WikiPaths, WikiRegex } from './locators';

export class PreferencesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private languageSelect(): Locator {
    return this.page.locator(WikiCss.languageSelect);
  }

  private userProfileTab(): Locator {
    return this.page.locator(WikiCss.userProfileTab);
  }

  private saveControlByName(): Locator {
    return this.page.locator(WikiCss.savePrefsControls);
  }

  /** Кнопка «Зберегти» за accessible name (якщо немає name=saveprefs). */
  private saveButtonByLabel(): Locator {
    return this.page.getByRole('button', { name: WikiRegex.saveButtonAccessibleName }).first();
  }

  /** Прямий URL — допоміжно; у кейсі перехід через меню користувача. */
  async open(): Promise<void> {
    await this.page.goto(WikiPaths.preferences);
    await this.dismissCookieBannerIfPresent();
  }

  async scrollInternationalisationSectionIntoView(): Promise<void> {
    const heading = this.page.getByRole('heading', {
      name: WikiRegex.internationalisationHeading
    });
    if ((await heading.count()) > 0) {
      await heading.first().scrollIntoViewIfNeeded();
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
    await expect(this.languageSelect()).toBeAttached({ timeout: 20_000 });
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

  async scrollSaveButtonIntoView(): Promise<void> {
    const named = this.saveControlByName();
    if ((await named.count()) > 0) {
      await named.first().scrollIntoViewIfNeeded();
      return;
    }
    await this.saveButtonByLabel().scrollIntoViewIfNeeded();
  }

  private async clickSaveControl(): Promise<void> {
    const named = this.saveControlByName();
    if ((await named.count()) > 0) {
      await named.first().click();
      return;
    }
    await this.saveButtonByLabel().click();
  }

  async savePreferences(): Promise<void> {
    await this.scrollSaveButtonIntoView();
    await this.clickSaveControl();
  }

  async expectSaveSuccessMessageIfPresent(): Promise<void> {
    const banner = this.page.locator(
      '.mw-message--success, .cdx-message--success, .successbox, .mw-notification-visible'
    );
    if ((await banner.count()) === 0) {
      return;
    }
    await expect(banner.first()).toBeVisible({ timeout: 8000 });
  }

  async expectSelectedLanguage(code: string): Promise<void> {
    await expect(this.languageSelect()).toHaveValue(code, { timeout: 20_000 });
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }
}
