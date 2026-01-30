'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLanguage = 'en' }: { children: React.ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguage(savedLanguage);
    } else {
      // Set initial language
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default values during build/SSR
    if (typeof window === 'undefined') {
      return {
        language: 'en' as Language,
        setLanguage: () => {},
        dir: 'ltr' as const,
      };
    }
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
