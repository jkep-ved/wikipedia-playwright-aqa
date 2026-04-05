import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Кнопка меню personal tools / облікового запису (різні мови та написання). */
const rePersonalToolsButton =
  /Особисті інструменти|особисті інструменти|Personal tools|Private tools|Strumenti personali|strumenti|інструменти|personale|personali/i;
/** Accessible name landmark'а `navigation` для блоку користувача. */
const reUserNavigationLandmark =
  /personal tools|особист|strumenti|інструменти|personale|personali/i;
const urlPatternPreferences = /Special:Preferences/;
const ms = {
  personalToolsClick: 6000,
  navButton: 3000,
  vectorOther: 2000,
  prefsLinkAttached: 10_000,
  prefsUrl: 20_000
} as const;
const vectorOpenSteps: ReadonlyArray<{
  locator: (p: Page) => Locator;
  timeoutMs: number;
  force?: boolean;
}> = [
  { locator: (p) => p.locator('#vector-user-links-dropdown'), timeoutMs: ms.navButton },
  {
    locator: (p) => p.locator('#vector-user-links-dropdown-checkbox'),
    timeoutMs: ms.vectorOther,
    force: true
  },
  {
    locator: (p) => p.locator('label[for="vector-user-links-dropdown-checkbox"]'),
    timeoutMs: ms.vectorOther
  }
];

export class UserMenuPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private personalToolsToggleByName(): Locator {
    return this.page
      .locator('#vector-user-links, #p-personal')
      .getByRole('button', { name: rePersonalToolsButton });
  }

  private async tryOpenVectorDropdowns(): Promise<boolean> {
    for (const { locator, timeoutMs, force } of vectorOpenSteps) {
      const target = locator(this.page);
      if (await this.isVisibleWithin(target, timeoutMs)) {
        await target.click(force ? { force: true } : {});
        return true;
      }
    }
    return false;
  }

  private async tryOpenFromNavigationLandmark(): Promise<boolean> {
    const nav = this.page.getByRole('navigation', { name: reUserNavigationLandmark });
    const byAria = nav.locator('button[aria-controls*="vector-user-links"]');
    if ((await byAria.count()) > 0 && (await this.isVisibleWithin(byAria, ms.navButton))) {
      await byAria.click();
      return true;
    }
    const byRole = nav.getByRole('button', { name: rePersonalToolsButton });
    if ((await byRole.count()) > 0 && (await this.isVisibleWithin(byRole, ms.navButton))) {
      await byRole.click();
      return true;
    }
    return false;
  }

  async openPersonalToolsMenu(): Promise<void> {
    try {
      await this.personalToolsToggleByName().click({ timeout: ms.personalToolsClick });
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
    if (await this.isVisibleWithin(directBar, ms.vectorOther)) {
      return;
    }

    throw new Error('Не вдалося відкрити меню облікового запису (personal tools)');
  }

  private preferencesRootLink(): Locator {
    return this.page.locator('#pt-preferences a[href*="Special:Preferences"]');
  }

  async openPreferencesFromUserMenu(): Promise<void> {
    await this.openPersonalToolsMenu();

    const prefsLink = this.preferencesRootLink();
    await expect(prefsLink).toBeAttached({ timeout: ms.prefsLinkAttached });
    await prefsLink.click({ force: true });

    await expect(this.page).toHaveURL(urlPatternPreferences, { timeout: ms.prefsUrl });
    await this.dismissCookieBannerIfPresent();
  }
}
