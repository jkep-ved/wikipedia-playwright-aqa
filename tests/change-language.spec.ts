import { expect, test, type Locator, type Page } from '@playwright/test';

async function pickDifferentLanguage(
  langSelect: Locator,
  preferred: string | undefined
): Promise<string> {
  const current = await langSelect.inputValue();
  if (preferred && preferred !== current) {
    await langSelect.selectOption(preferred);
    return preferred;
  }
  const alternate = await langSelect.evaluate((el: HTMLSelectElement) => {
    const values = [...el.options].map((o) => o.value).filter(Boolean);
    return values.find((v) => v !== el.value) ?? null;
  });
  if (!alternate) {
    throw new Error('Не знайдено альтернативної мови в списку wplanguage');
  }
  await langSelect.selectOption(alternate);
  return alternate;
}

async function dismissCookieBannerIfPresent(page: Page): Promise<void> {
  const accept = page.getByRole('button', {
    name: /accept|прийняти|ok|згоден|i agree/i
  });
  try {
    await accept.click({ timeout: 3000 });
  } catch {
    /* банер відсутній */
  }
}

test.describe('Зміна мови інтерфейсу Wikipedia', () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.WIKI_USERNAME || !process.env.WIKI_PASSWORD,
      'Заповніть WIKI_USERNAME та WIKI_PASSWORD у файлі .env'
    );
  });

  test('авторизований користувач змінює мову інтерфейсу в Preferences', async ({
    page,
    baseURL
  }) => {
    const username = process.env.WIKI_USERNAME!;
    const password = process.env.WIKI_PASSWORD!;
    const preferredTarget = process.env.TARGET_LANGUAGE?.trim() || undefined;

    await page.goto('/wiki/Special:UserLogin');
    await dismissCookieBannerIfPresent(page);

    await page.locator('#wpName1').fill(username);
    await page.locator('#wpPassword1').fill(password);
    await page.locator('#wpLoginAttempt').click();

    await expect(page.locator('#wpName1')).toBeHidden({ timeout: 30_000 });

    await page.goto('/wiki/Special:Preferences');
    await dismissCookieBannerIfPresent(page);

    const userProfileTab = page.locator('a[href="#mw-prefsection-personal"]');
    if (await userProfileTab.isVisible()) {
      await userProfileTab.click();
    }

    const langSelect = page.locator('select[name="wplanguage"]');
    await expect(langSelect).toBeVisible({ timeout: 20_000 });

    const chosen = await pickDifferentLanguage(langSelect, preferredTarget);

    const prefsForm = page.locator('#mw-prefs-form');
    await prefsForm.getByRole('button', { name: /save|зберегти|записати/i }).click();

    const langAfterSave = page.locator('select[name="wplanguage"]');
    await expect(langAfterSave).toHaveValue(chosen, { timeout: 20_000 });

    await page.reload();
    await expect(page.locator('select[name="wplanguage"]')).toHaveValue(chosen);

    await page.goto('/wiki/Main_Page');
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang?.toLowerCase().startsWith(chosen.split('-')[0].toLowerCase())).toBeTruthy();
  });
});
