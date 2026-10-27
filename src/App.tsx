import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { AssetDetail } from './pages/AssetDetail';
import { NotFound } from './pages/NotFound';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggle = () => setLang(l => l === 'ar' ? 'en' : 'ar');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header lang={lang} onToggleLang={toggle} />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard lang={lang} />} />
            <Route path="/inventory" element={<Inventory lang={lang} />} />
            <Route path="/asset/:id" element={<AssetDetail lang={lang} />} />
            <Route path="*" element={<NotFound lang={lang} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
