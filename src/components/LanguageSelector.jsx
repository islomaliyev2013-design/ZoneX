import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({ variant = 'header' }) {
  const { currentLang, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  const isAuthPage =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/login' || window.location.pathname === '/register');

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-[rgba(167,139,250,0.15)] shadow-xs cursor-pointer bg-[#1D1B2E] hover:bg-[#25233B] text-white hover:border-[#7C3AED]/40"
        aria-label="Select Language"
      >
        <span className="text-sm leading-none">{activeLanguage.flag}</span>
        <span className="font-semibold">{activeLanguage.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform text-[#A1A1AA] ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-44 rounded-xl shadow-2xl border border-[rgba(167,139,250,0.15)] py-1.5 z-50 animate-in fade-in zoom-in-95 bg-[#1D1B2E] text-white backdrop-blur-md"
        >
          <div
            className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-b text-[#A1A1AA] border-[rgba(167,139,250,0.15)]"
          >
            Language / Til / Язык
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#7C3AED]/20 text-[#A78BFA] font-bold'
                    : 'text-[#A1A1AA] hover:bg-[#25233B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && (
                  <Check
                    className="w-3.5 h-3.5 text-[#A78BFA]"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
