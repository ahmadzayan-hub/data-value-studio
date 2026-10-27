import { useNavigate } from 'react-router-dom';
import { Database, Shield, Globe, BarChart3, Clock } from 'lucide-react';
import { RECENT_ACTIVITY } from '../data/assets';

interface Props { lang: 'ar' | 'en' }

export function Dashboard({ lang }: Props) {
  const navigate = useNavigate();
  const ar = lang === 'ar';

  const tiles = [
    { icon: <Database size={24} className="text-gold" />, value: '12', labelAr: 'إجمالي الأصول', labelEn: 'Total Assets' },
    { icon: <Shield size={24} className="text-blue-500" />, value: '7', labelAr: 'خاضعة للحوكمة', labelEn: 'Governed' },
    { icon: <Globe size={24} className="text-green-500" />, value: '3', labelAr: 'منشورة', labelEn: 'Published' },
    { icon: <BarChart3 size={24} className="text-amber-500" />, value: '74%', labelAr: 'متوسط جودة البيانات', labelEn: 'Avg Quality Score' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">
          {ar ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {ar ? 'نظرة عامة على أصول البيانات المُدارة' : 'Overview of your governed data assets'}
        </p>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {tiles.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
            {t.icon}
            <div className="text-3xl font-bold text-navy">{t.value}</div>
            <div className="text-sm text-gray-500">{ar ? t.labelAr : t.labelEn}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/inventory')}
        className="mb-10 bg-gold hover:bg-gold-light text-navy font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
      >
        {ar ? 'عرض المخزون ←' : 'View Inventory →'}
      </button>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-gold" />
          <h2 className="font-semibold text-navy">{ar ? 'النشاط الأخير' : 'Recent Activity'}</h2>
        </div>
        <ul className="divide-y divide-gray-50">
          {RECENT_ACTIVITY.map((a, i) => (
            <li key={i} className="py-3">
              <p className="text-sm text-gray-800">{ar ? a.ar : a.en}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
