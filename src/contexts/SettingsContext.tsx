import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const LS_THEME = 'finpower:theme';
const LS_LOCALE = 'finpower:locale';
const LS_CURRENCY = 'finpower:currency';
const LS_SIDEBAR_COLLAPSE = 'finpower:sidebar:collapse';

function readLS(key: string, fallback: any) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}
function saveLS(key: string, v: any) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

type Settings = {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  locale: string;
  setLocale: (l: string) => void;
  currency: string;
  setCurrency: (c: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean) => void;
  formatCurrency: (v: number) => string;
  formatDate: (iso?: string) => string;
};

const SettingsContext = createContext<Settings | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<'light'|'dark'>(readLS(LS_THEME, 'light'));
  const [locale, setLocaleState] = useState<string>(readLS(LS_LOCALE, 'pt-PT'));
  const [currency, setCurrencyState] = useState<string>(readLS(LS_CURRENCY, 'EUR'));
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(readLS(LS_SIDEBAR_COLLAPSE, false));

  useEffect(() => { saveLS(LS_THEME, theme); document.documentElement.classList.toggle('theme-dark', theme === 'dark'); }, [theme]);
  useEffect(() => { saveLS(LS_LOCALE, locale); }, [locale]);
  useEffect(() => { saveLS(LS_CURRENCY, currency); }, [currency]);
  useEffect(() => { saveLS(LS_SIDEBAR_COLLAPSE, sidebarCollapsed); }, [sidebarCollapsed]);

  const setTheme = (t: 'light' | 'dark') => setThemeState(t);
  const setLocale = (l: string) => setLocaleState(l);
  const setCurrency = (c: string) => setCurrencyState(c);
  const setSidebarCollapsed = (c: boolean) => setSidebarCollapsedState(c);

  const formatCurrency = useMemo(() => {
    const nf = new Intl.NumberFormat(locale, { style: 'currency', currency });
    return (v: number) => nf.format(v);
  }, [locale, currency]);

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      // normalize YYYY-MM-DD
      const parts = iso.split('-').map(Number);
      if (parts.length >= 3) {
        const d = new Date(parts[0], parts[1]-1, parts[2]);
        return d.toLocaleDateString(locale);
      }
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale);
    } catch { return iso; }
  };

  const value = { theme, setTheme, locale, setLocale, currency, setCurrency, sidebarCollapsed, setSidebarCollapsed, formatCurrency, formatDate } as Settings;

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
