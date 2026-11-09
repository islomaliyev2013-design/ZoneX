import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../translations/en.json';
import ruTranslations from '../translations/ru.json';
import uzTranslations from '../translations/uz.json';

const LANGUAGE_KEY = 'ps_language_v1';

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uz', name: 'O‘zbekcha', flag: '🇺🇿' },
];

const translationsMap = {
  en: enTranslations,
  ru: ruTranslations,
  uz: uzTranslations,
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved && (saved === 'en' || saved === 'ru' || saved === 'uz')) {
        return saved;
      }
    } catch (e) {
      console.error('Failed to load language from localStorage:', e);
    }
    return 'en'; // default English
  });

  const changeLanguage = (langCode) => {
    if (translationsMap[langCode]) {
      setCurrentLang(langCode);
      try {
        localStorage.setItem(LANGUAGE_KEY, langCode);
      } catch (e) {
        console.error('Failed to save language to localStorage:', e);
      }
    }
  };

  /**
   * Helper function to translate keys with parameter substitution
   * Usage: t('dashboard.title') or t('dashboard.utilization', { percent: 40 })
   */
  const t = (keyPath, params = {}) => {
    if (!keyPath) return '';

    const getNested = (obj, path) => {
      const parts = path.split('.');
      let current = obj;
      for (const p of parts) {
        if (current == null || typeof current !== 'object') return null;
        current = current[p];
      }
      return current;
    };

    // Try current language
    let template = getNested(translationsMap[currentLang], keyPath);

    // Fallback to English if missing
    if (template == null && currentLang !== 'en') {
      template = getNested(translationsMap.en, keyPath);
    }

    // Fallback to raw key if not found
    if (template == null) {
      return keyPath;
    }

    if (typeof template !== 'string') {
      return template;
    }

    // Replace {placeholder} with params
    return template.replace(/\{(\w+)\}/g, (_, match) => {
      return params[match] !== undefined ? params[match] : `{${match}}`;
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        changeLanguage,
        languages: LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
