import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

const pathMainPage = '/wiki/Main_Page';

export class MainPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(pathMainPage);
  }

  async expectInterfaceLangStartsWith(languageCode: string): Promise<void> {
    const prefix = languageCode.split('-')[0].toLowerCase();
    const lang = (await this.page.locator('html').getAttribute('lang'))?.toLowerCase() ?? '';
    expect(
      lang.startsWith(prefix),
      `очікується html[lang] з префіксом "${prefix}", фактично lang="${lang || '(порожньо)'}"`
    ).toBe(true);
  }
}
