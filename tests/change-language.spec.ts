import { test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { LoginPage, MainPage, PreferencesPage, UserMenuPage } from '../pages';

function pages(page: Page) {
  return {
    main: new MainPage(page),
    login: new LoginPage(page),
    userMenu: new UserMenuPage(page),
    preferences: new PreferencesPage(page)
  };
}

test.describe('Зміна мови інтерфейсу Wikipedia', () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.WIKI_USERNAME || !process.env.WIKI_PASSWORD,
      'Заповніть WIKI_USERNAME та WIKI_PASSWORD у файлі .env'
    );
  });

  test('TC-UI-LANG-01: зміна мови інтерфейсу зареєстрованим користувачем через сторінку налаштувань', async ({ page }) => {
    const { main, login, userMenu, preferences } = pages(page);
    const username = process.env.WIKI_USERNAME!;
    const password = process.env.WIKI_PASSWORD!;

    await test.step('1. Відкрити головну сторінку цільової вікі', async () => {
      await main.open();
    });

    await test.step('2. Авторизуватися (посилання на вхід у шапці сторінки)', async () => {
      await login.openLoginFormFromHeader();
      await login.login(username, password);
      await login.expectLoginSuccessful();
    });

    await test.step('3–4. Меню облікового запису → персональні налаштування (Special:Preferences)', async () => {
      await userMenu.openPreferencesFromUserMenu();
    });

    await test.step('5. Вкладка профілю та поле мови інтерфейсу', async () => {
      await preferences.openUserProfileTabIfVisible();
    });

    const chosen = await test.step('6. Зафіксувати поточну мову; обрати іншу в списку', async () =>
      preferences.selectDifferentInterfaceLanguage()
    );

    await test.step('7. Натиснути «Зберегти»', async () => {
      await preferences.savePreferences();
    });

    await test.step('Очікуваний результат: у полі відображається обрана мова', async () => {
      await preferences.expectSelectedLanguage(chosen);
    });

    await test.step('Очікуваний результат: після перезавантаження та переходу — мова інтерфейсу', async () => {
      await preferences.reload();
      await preferences.expectSelectedLanguage(chosen);

      await main.open();
      await main.expectInterfaceLangStartsWith(chosen);
    });
  });
});
