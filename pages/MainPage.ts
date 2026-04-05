import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { WikiPaths } from './locators';

export class MainPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(WikiPaths.main);
  }

  async getDocumentLang(): Promise<string | null> {
    return this.page.locator('html').getAttribute('lang');
  }

  async expectInterfaceLangStartsWith(languageCode: string): Promise<void> {
    const prefix = languageCode.split('-')[0].toLowerCase();
    const lang = await this.getDocumentLang();
    expect(lang?.toLowerCase().startsWith(prefix)).toBeTruthy();
  }
}
