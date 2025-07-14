import { createContext, useContext, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import enTranslations from '../locales/en.json';
import jpTranslations from '../locales/jp.json';

export type Language = 'en' | 'jp';

type I18nProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type I18nProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: ReturnType<typeof useTranslation>['t'];
  isReady: boolean;
};

const initialState: I18nProviderState = {
  language: 'en',
  setLanguage: () => null,
  // @ts-expect-error - useTranslation is not typed
  t: (key: string) => key,
  isReady: false,
};

const I18nProviderContext = createContext<I18nProviderState>(initialState);

// Initialize i18next
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: enTranslations,
    },
    jp: {
      translation: jpTranslations,
    },
  },
});

export const I18nProvider = ({
  children,
  defaultLanguage = 'en',
  storageKey = 'app-language',
  ...props
}: I18nProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(storageKey) as Language;
    return stored === 'en' || stored === 'jp' ? stored : defaultLanguage;
  });
  const [isReady, setIsReady] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const initLanguage = async () => {
      await i18n.changeLanguage(language);

      const title = i18n.t('app.title');
      document.title = title;

      setIsReady(true);
    };
    initLanguage();
  }, [language]);

  const setLanguage = async (newLanguage: Language) => {
    const title = i18n.t('app.title');
    document.title = title;

    localStorage.setItem(storageKey, newLanguage);
    setLanguageState(newLanguage);
    await i18n.changeLanguage(newLanguage);
  };

  const value = {
    language,
    setLanguage,
    t,
    isReady,
  };

  return (
    <I18nProviderContext.Provider {...props} value={value}>
      {children}
    </I18nProviderContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nProviderContext);

  if (context === undefined)
    throw new Error('useI18n must be used within an I18nProvider');

  return context;
};
