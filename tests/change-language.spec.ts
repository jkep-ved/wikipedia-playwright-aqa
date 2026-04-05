import { expect, test } from '@playwright/test';
import { LoginPage, MainPage, PreferencesPage, UserMenuPage } from '../pages';

test.describe('Зміна мови інтерфейсу Wikipedia', () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.WIKI_USERNAME || !process.env.WIKI_PASSWORD,
      'Заповніть WIKI_USERNAME та WIKI_PASSWORD у файлі .env'
    );
  });

  test('TC-UI-LANG-01: зміна мови інтерфейсу зареєстрованим користувачем через сторінку налаштувань', async ({ page }) => {
    const mainPage = new MainPage(page);
    const loginPage = new LoginPage(page);
    const userMenuPage = new UserMenuPage(page);
    const preferencesPage = new PreferencesPage(page);

    const username = process.env.WIKI_USERNAME!;
    const password = process.env.WIKI_PASSWORD!;
    const preferredTarget = process.env.TARGET_LANGUAGE?.trim() || undefined;

    await test.step('1. Відкрити головну сторінку цільової вікі', async () => {
      await mainPage.open();
    });

    await test.step('2. Авторизуватися (посилання на вхід у шапці сторінки)', async () => {
      await loginPage.openLoginFormFromHeader();
      await loginPage.login(username, password);
      await loginPage.expectLoginSuccessful();
    });

    await test.step('3–4. Меню облікового запису → персональні налаштування (Special:Preferences)', async () => {
      await userMenuPage.openPreferencesFromUserMenu();
    });

    await test.step('5. Вкладка профілю та розділ інтернаціоналізації', async () => {
      await preferencesPage.openUserProfileTabIfVisible();
      await preferencesPage.scrollInternationalisationSectionIntoView();
      await preferencesPage.expectLanguageSelectReady();
    });

    const chosen = await test.step('6. Зафіксувати поточну мову; обрати іншу в списку', async () => {
      const before = await preferencesPage.getCurrentInterfaceLanguageCode();
      expect(before.length).toBeGreaterThan(0);
      const next = await preferencesPage.selectDifferentInterfaceLanguage(preferredTarget);
      expect(next).not.toBe(before);
      return next;
    });

    await test.step('7. Прокрутити донизу та натиснути «Зберегти»', async () => {
      await preferencesPage.savePreferences();
    });

    await test.step('Очікуваний результат: успіх збереження (за наявності) та обрана мова в полі', async () => {
      await preferencesPage.expectSaveSuccessMessageIfPresent();
      await preferencesPage.expectSelectedLanguage(chosen);
    });

    await test.step('Очікуваний результат: після перезавантаження та переходу — мова інтерфейсу', async () => {
      await preferencesPage.reload();
      await preferencesPage.expectSelectedLanguage(chosen);

      await mainPage.open();
      await mainPage.expectInterfaceLangStartsWith(chosen);
    });
  });
});
