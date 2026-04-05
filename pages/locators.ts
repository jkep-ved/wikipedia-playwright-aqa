/**
 * Єдине джерело селекторів і шаблонів для Wikimedia / Vector (DRY).
 * Page objects лише компонують їх у дії над Page.
 */
export const WikiPaths = {
  main: '/wiki/Main_Page',
  login: '/wiki/Special:UserLogin',
  preferences: '/wiki/Special:Preferences'
} as const;

/** Перевірки URL після навігації. */
export const WikiUrlPatterns = {
  preferences: /Special:Preferences/
} as const;

export const WikiIds = {
  loginUsername: '#wpName1',
  loginPassword: '#wpPassword1',
  loginSubmit: '#wpLoginAttempt'
} as const;

/** Селектори за атрибутом name (не залежать від мови UI). */
export const WikiCss = {
  loginFromSiteLink: 'a[href*="Special:UserLogin"]',
  languageSelect: 'select[name="wplanguage"]',
  userProfileTab: 'a[href="#mw-prefsection-personal"]',
  savePrefsControls:
    'button[name="saveprefs"], input[name="saveprefs"], button[name="wpSaveprefs"], input[name="wpSaveprefs"]',
  /** Головна сторінка налаштувань без #fragment (уникаємо «Бета-функції» тощо). */
  preferencesRootLink:
    'a[href="/wiki/Special:Preferences"], a[href$="/wiki/Special:Preferences"], a[href*="title=Special:Preferences"]:not([href*="#"]):not([href*="reset"])'
} as const;

export const WikiRegex = {
  personalToolsToggle: /Особисті інструменти|Personal tools|Private tools|Strumenti personali/i,
  personalNavigationLandmark: /personal tools|особист|strumenti|інструменти|pirsonali|personale/i,
  personalToolsButtonInNav:
    /особисті інструменти|personal tools|private tools|strumenti|інструменти|pirsonali/i,
  saveButtonAccessibleName:
    /save|зберегти|записати|salva|speicher|enregistrer|zapisz|guardar|sauvegarder|opslaan|kaydet|spara|gem|保存|记录/i,
  internationalisationHeading:
    /інтернаціоналізація|internationalisation|internationalization|internazionalizzazione|интернационализация|internationalisierung/i
} as const;
