import { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/en';
import { es } from '../i18n/es';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState(en);

    useEffect(() => {
        // Load saved language
        const savedLanguage = localStorage.getItem('clicker_language');
        if (savedLanguage) {
            setLanguage(savedLanguage);
            setTranslations(savedLanguage === 'es' ? es : en);
        }
    }, []);

    const switchLanguage = (lang) => {
        setLanguage(lang);
        setTranslations(lang === 'es' ? es : en);
        localStorage.setItem('clicker_language', lang);
    };

    const t = (key) => {
        return translations[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t, translations }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
