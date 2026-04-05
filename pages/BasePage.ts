import type { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async dismissCookieBannerIfPresent(): Promise<void> {
    const accept = this.page.getByRole('button', {
      name: /accept|прийняти|ok|згоден|i agree/i
    });
    try {
      await accept.click({ timeout: 3000 });
    } catch {
    }
  }
}
