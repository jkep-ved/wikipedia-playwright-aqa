import type { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Швидка перевірка видимості без винятку в логах. */
  protected async isVisibleWithin(locator: Locator, timeoutMs: number): Promise<boolean> {
    return locator.isVisible({ timeout: timeoutMs }).catch(() => false);
  }

  async dismissCookieBannerIfPresent(): Promise<void> {
    const accept = this.page.getByRole('button', {
      name: /accept|прийняти|ok|згоден|i agree/i
    });
    try {
      await accept.click({ timeout: 3000 });
    } catch {
      /* банер відсутній */
    }
  }
}
