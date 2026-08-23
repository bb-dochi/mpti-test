/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { normalizeLanguage } from "../data/localization";

const LanguageContext = createContext(null);
const STORAGE_KEY = "mpti-language";
const getInitialLanguage = () => {
    const queryLanguage = new URLSearchParams(window.location.search).get("lang");
    if (queryLanguage === "kr" || queryLanguage === "en") return queryLanguage;
    return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(getInitialLanguage);
    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language === "kr" ? "ko" : "en";
    }, [language]);
    const value = useMemo(() => ({ language, setLanguage }), [language]);
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
    return context;
}
