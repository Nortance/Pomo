import i18nConfig from '@/i18nConfig';

type TranslationMessages = Record<string, string>;

const translationsCache: Record<string, TranslationMessages> = {};

async function loadTranslations(locale: string): Promise<TranslationMessages> {
  if (translationsCache[locale]) {
    return translationsCache[locale];
  }

  try {
    const messages = (await import(`@/messages/${locale}.json`)).default;
    translationsCache[locale] = messages;
    return messages;
  } catch {
    // Fallback to English
    if (locale !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
}

export async function getTranslations(locale: string) {
  const validLocale = i18nConfig.locales.includes(locale) ? locale : 'en';
  const messages = await loadTranslations(validLocale);

  return function t(key: string, params?: Record<string, string | number>): string {
    let text = messages[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }

    return text;
  };
}
