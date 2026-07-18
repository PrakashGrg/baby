import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, TranslationKey } from '../translations';

const STORAGE_KEY = 'language_mode';

type Language = 'en' | 'ne';

interface LanguageContextType {
  language: Language;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Language) => void;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'ne') {
        setLanguageState(stored);
      }
      setIsLoaded(true);
    });
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang);
  }

  function t(key: TranslationKey): string {
    return translations[language][key] || translations.en[key] || key;
  }

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}