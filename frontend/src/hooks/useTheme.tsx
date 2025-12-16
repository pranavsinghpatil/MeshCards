import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'default' | 'anki' | 'sunset' | 'violet' | 'dark';

interface ThemeOption {
  name: ThemeName;
  label: string;
  color: string;
}

export const themes: ThemeOption[] = [
  { name: 'default', label: 'Teal', color: '#2dd4bf' },
  { name: 'anki', label: 'Anki Blue', color: '#3b82f6' },
  { name: 'sunset', label: 'Sunset', color: '#f97316' },
  { name: 'violet', label: 'Violet', color: '#8b5cf6' },
  { name: 'dark', label: 'Dark', color: '#1e293b' },
];

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as ThemeName) || 'default';
    }
    return 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme === 'default' ? '' : theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
