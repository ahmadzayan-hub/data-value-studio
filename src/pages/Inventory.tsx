import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { DEMO_ASSETS, Classification, AssetStatus } from '../data/assets';

interface Props { lang: 'ar' | 'en' }

const classColors: Record<Classification, string> = {
  Public: 'bg-green-100 text-green-800',
  Confidential: 'bg-amber-100 text-amber-800',
  Restricted: 'bg-red-100 text-red-800',
};

const statusColors: Record<AssetStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Reviewed: 'bg-blue-100 text-blue-700',
  Approved: 'bg-purple-100 text-purple-800',
  Published: 'bg-green-100 text-green-800',
};

const classLabels: Record<Classification, { ar: string }> = {
  Public: { ar: 'عام' },
  Confidential: { ar: 'سري' },
  Restricted: { ar: 'مقيد' },
};

const statusLabels: Record<AssetStatus, { ar: string }> = {
  Draft: { ar: 'مسودة' },
  Reviewed: { ar: 'تمت المراجعة' },
  Approved: { ar: 'موافق عليه' },
  Published: { ar: 'منشور' },
};

export function Inventory({ lang }: Props) {
  const navigate = useNavigate();
  const ar = lang === 'ar';
  const [query, setQuery] = useState('');
  const [filterClass, setFilterClass] = useState<Classification | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<AssetStatus | 'All'>('All');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_ASSETS.filter(a => {
      if (filterClass !== 'All' && a.classification !== filterClass) return false;
      if (filterStatus !== 'All' && a.status !== filterStatus) return false;
      if (!q) return true;
      return [a.nameEn, a.nameAr].some(s => s.toLowerCase().includes(q));
    });
  }, [query, filterClass, filterStatus]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">{ar ? 'مخزون الأصول' : 'Data Inventory'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {ar ? `${visible.length} أصل بيانات` : `${visible.length} assets`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
          <input
            className="w-full border border-gray-200 rounded-xl ps-9 pe-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            placeholder={ar ? 'بحث باسم الأصل...' : 'Search by asset name...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          value={filterClass}
          onChange={e => setFilterClass(e.target.value as Classification | 'All')}
        >
          <option value="All">{ar ? 'كل التصنيفات' : 'All Classifications'}</option>
          {(['Public', 'Confidential', 'Restricted'] as Classification[]).map(c => (
            <option key={c} value={c}>{ar ? classLabels[c].ar : c}</option>
          ))}
        </select>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as AssetStatus | 'All')}
        >
          <option value="All">{ar ? 'كل الحالات' : 'All Statuses'}</option>
          {(['Draft', 'Reviewed', 'Approved', 'Published'] as AssetStatus[]).map(s => (
            <option key={s} value={s}>{ar ? statusLabels[s].ar : s}</option>
          ))}
        </select>
      </div>

      {/* Asset cards */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {ar ? 'لا توجد نتائج مطابقة' : 'No matching assets'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map(a => (
            <button
              key={a.id}
              onClick={() => navigate(`/asset/${a.id}`)}
              className="text-start bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gold/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-semibold text-navy text-sm">{ar ? a.nameAr : a.nameEn}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{ar ? a.nameEn : a.nameAr}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${classColors[a.classification]}`}>
                    {ar ? classLabels[a.classification].ar : a.classification}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[a.status]}`}>
                    {ar ? statusLabels[a.status].ar : a.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{ar ? 'المالك:' : 'Owner:'} {a.owner}</span>
                <span className="flex items-center gap-1">
                  <span className={`font-bold ${a.qualityScore >= 80 ? 'text-green-600' : a.qualityScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                    {a.qualityScore}%
                  </span>
                  <span className="text-gray-400">{ar ? 'الجودة' : 'Quality'}</span>
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {ar ? 'آخر تحديث:' : 'Updated:'} {a.lastUpdated}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
