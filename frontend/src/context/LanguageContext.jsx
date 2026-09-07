import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default to Hindi ('hi') as primary language, with Marathi and English optional
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sih_krishi_lang') || 'hi';
  });

  useEffect(() => {
    localStorage.setItem('sih_krishi_lang', language);
  }, [language]);

  const t = (key) => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
