import { useState } from "react";
import { useLanguage } from "./LanguageContext";

function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{ position: "fixed", top: "12px", right: "12px", zIndex: 1000, fontFamily: "'Maplestory-Light', sans-serif" }}>
            <button type="button" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 9px", border: "1px solid rgba(17,17,17,.18)", borderRadius: "999px", background: "rgba(255,255,255,.78)", color: "rgba(17,17,17,.68)", boxShadow: "0 2px 8px rgba(0,0,0,.08)", backdropFilter: "blur(5px)", fontFamily: "inherit", fontSize: ".7rem", fontWeight: "bold", cursor: "pointer" }}>
                <span>Language: {language.toUpperCase()}</span>
                <span aria-hidden="true" style={{ fontSize: ".6rem", transform: isOpen ? "rotate(180deg)" : "none" }}>⌄</span>
            </button>
            {isOpen && (
                <div role="listbox" aria-label="Language" style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: "112px", padding: "5px", border: "1px solid rgba(17,17,17,.14)", borderRadius: "9px", background: "rgba(255,255,255,.96)", boxShadow: "0 5px 16px rgba(0,0,0,.12)", boxSizing: "border-box" }}>
                    {[{ value: "kr", label: "한국어" }, { value: "en", label: "English" }].map((item) => (
                        <button key={item.value} type="button" role="option" aria-selected={language === item.value} onClick={() => { setLanguage(item.value); setIsOpen(false); }} style={{ width: "100%", padding: "7px 6px", border: 0, borderRadius: "6px", background: language === item.value ? "rgba(241,196,15,.24)" : "transparent", color: "rgba(17,17,17,.78)", textAlign: "left", fontFamily: "inherit", fontSize: ".75rem", fontWeight: language === item.value ? "900" : "bold", cursor: "pointer" }}>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
export default LanguageSelector;
