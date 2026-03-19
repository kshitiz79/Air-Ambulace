import React, { createContext, useContext, useState } from 'react';
import translations from '../languages/index';
import { localizeEnquiry } from '../utils/getLocalizedField';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = translations[language];

  // Convenience: localize an enquiry object to the current language
  const localize = (enquiry) => localizeEnquiry(enquiry, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localize }}>
      {children}
    </LanguageContext.Provider>
  );
};
