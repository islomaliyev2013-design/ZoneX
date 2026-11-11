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
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border shadow-xs cursor-pointer ${
          isAuthPage
            ? 'bg-midnight-card hover:bg-midnight-hover text-slate-200 hover:text-white border-midnight-border'
            : 'bg-white hover:bg-[#F5F5F4] text-[#292524] border-[#E7E5E4]'
        }`}
        aria-label="Select Language"
      >
        <span className="text-sm leading-none">{activeLanguage.flag}</span>
        <span className="font-semibold">{activeLanguage.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            isAuthPage ? 'text-slate-400' : 'text-[#78716C]'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-1.5 w-44 rounded-xl shadow-xl border py-1.5 z-50 animate-in fade-in zoom-in-95 ${
            isAuthPage
              ? 'bg-midnight-card text-white border-midnight-border backdrop-blur-md'
              : 'bg-white text-[#292524] border-[#E7E5E4]'
          }`}
        >
          <div
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${
              isAuthPage ? 'text-slate-400 border-midnight-border' : 'text-[#78716C] border-[#E7E5E4]'
            }`}
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
                    ? isAuthPage
                      ? 'bg-[#06B6D4]/15 text-[#22D3EE] font-bold'
                      : 'bg-[#F0FDFA] text-[#0D9488] font-bold'
                    : isAuthPage
                    ? 'text-slate-300 hover:bg-[#1B2736] hover:text-white'
                    : 'text-[#292524] hover:bg-[#F5F5F4]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      isAuthPage ? 'text-[#22D3EE]' : 'text-[#0D9488]'
                    }`}
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
