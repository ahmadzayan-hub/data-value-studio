import { Database } from 'lucide-react';

interface HeaderProps {
  lang: 'ar' | 'en';
  onToggleLang: () => void;
}

export function Header({ lang, onToggleLang }: HeaderProps) {
  return (
    <header className="bg-navy text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="text-gold" size={28} />
          <div>
            <div className="font-bold text-lg leading-tight">
              {lang === 'ar' ? 'استوديو قيمة البيانات' : 'Data Value Studio'}
            </div>
            <div className="text-xs text-gold-light opacity-80">
              {lang === 'ar' ? 'Data Value Studio' : 'استوديو قيمة البيانات'}
            </div>
          </div>
        </div>
        <button
          onClick={onToggleLang}
          className="bg-navy-light hover:bg-gold hover:text-navy transition-colors px-4 py-2 rounded-lg text-sm font-semibold border border-gold/30"
        >
          {lang === 'ar' ? 'English' : 'عربي'}
        </button>
      </div>
    </header>
  );
}
