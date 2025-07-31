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
    let value: unknown = localeTranslations;

    for (const k of keys) {
        if (value !== null && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
        } else {
            return key;
        }
    }

    return typeof value === 'string' ? value : key;
}
