import { Palette } from 'lucide-react';
import { useTheme, themes } from '@/hooks/useTheme';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative group">
      <button className="btn-ghost p-2" title="Change theme">
        <Palette className="w-5 h-5" />
      </button>
      <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[140px]">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              theme === t.name ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <span
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: t.color }}
            />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
