import enTranslations from '../translations/en.json';
import nlTranslations from '../translations/nl.json';

const translations = {
    en: enTranslations,
    nl: nlTranslations,
} as const;

export function getTranslation(locale: string, key: string): string {
    const localeTranslations = translations[locale as keyof typeof translations] || translations.en;

    // Navigate through nested object using dot notation
    const keys = key.split('.');
    let value: any = localeTranslations;

    for (const k of keys) {
        value = value?.[k];
    }

    return typeof value === 'string' ? value : key;
}
