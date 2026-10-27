import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Circle } from 'lucide-react';
import { DEMO_ASSETS, PIPELINE_STEPS } from '../data/assets';
import { QualityRing } from '../components/QualityRing';
import { Toast } from '../components/Toast';

interface Props { lang: 'ar' | 'en' }

type Tab = 'overview' | 'lineage' | 'usage';

const classColors: Record<string, string> = {
  Public: 'bg-green-100 text-green-800',
  Confidential: 'bg-amber-100 text-amber-800',
  Restricted: 'bg-red-100 text-red-800',
};

const classLabels: Record<string, string> = { Public: 'عام', Confidential: 'سري', Restricted: 'مقيد' };

export function AssetDetail({ lang }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const ar = lang === 'ar';
  const [tab, setTab] = useState<Tab>('overview');
  const [toast, setToast] = useState(false);

  const asset = DEMO_ASSETS.find(a => a.id === id);
  if (!asset) {
    navigate('/not-found');
    return null;
  }

  const tabs: { key: Tab; labelAr: string; labelEn: string }[] = [
    { key: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview' },
    { key: 'lineage', labelAr: 'السلسلة', labelEn: 'Lineage' },
    { key: 'usage', labelAr: 'الاستخدام', labelEn: 'Usage' },
  ];

  const BackIcon = ar ? ArrowRight : ArrowLeft;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {toast && (
        <Toast
          message={ar ? 'تم إرسال طلب الموافقة بنجاح' : 'Approval request submitted successfully'}
          onClose={() => setToast(false)}
        />
      )}

      <button
        onClick={() => navigate('/inventory')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy mb-6 transition-colors"
      >
        <BackIcon size={16} />
        {ar ? 'العودة إلى المخزون' : 'Back to Inventory'}
      </button>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">{ar ? asset.nameAr : asset.nameEn}</h1>
          <p className="text-gray-400 text-sm mt-1">{ar ? asset.nameEn : asset.nameAr}</p>
        </div>
        <div className="flex items-center gap-3">
          <QualityRing score={asset.qualityScore} size={72} />
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${classColors[asset.classification]}`}>
            {ar ? classLabels[asset.classification] : asset.classification}
          </span>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-navy mb-4">{ar ? 'مسار المصنع' : 'Factory Pipeline'}</h2>
        <div className="space-y-2.5">
          {PIPELINE_STEPS.map((step, i) => {
            const done = i < asset.pipelineStepsCompleted;
            return (
              <div key={i} className={`flex items-center gap-3 text-sm ${done ? 'text-gray-800' : 'text-gray-400'}`}>
                {done
                  ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                  : <Circle size={18} className="text-gray-300 flex-shrink-0" />
                }
                <span>{ar ? step.ar : step.en}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t.key ? 'text-navy border-b-2 border-gold' : 'text-gray-400 hover:text-gray-700'}`}
            >
              {ar ? t.labelAr : t.labelEn}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'overview' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">{ar ? asset.descriptionAr : asset.descriptionEn}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">{ar ? 'المالك:' : 'Owner:'}</span> <span className="font-medium">{asset.owner}</span></div>
                <div><span className="text-gray-400">{ar ? 'آخر تحديث:' : 'Updated:'}</span> <span className="font-medium">{asset.lastUpdated}</span></div>
                <div><span className="text-gray-400">{ar ? 'الحالة:' : 'Status:'}</span> <span className="font-medium">{ar ? asset.status : asset.status}</span></div>
                <div><span className="text-gray-400">{ar ? 'خطوات مكتملة:' : 'Steps done:'}</span> <span className="font-medium">{asset.pipelineStepsCompleted} / {PIPELINE_STEPS.length}</span></div>
              </div>
            </div>
          )}
          {tab === 'lineage' && (
            <div className="text-sm text-gray-500 space-y-2">
              <p className="font-medium text-gray-700">{ar ? 'سلسلة البيانات (تجريبية)' : 'Data Lineage (demo)'}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-navy text-white px-2 py-1 rounded">{ar ? 'مصدر أولي' : 'Source System'}</span>
                <span>→</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{ar ? 'معالجة' : 'ETL Pipeline'}</span>
                <span>→</span>
                <span className="bg-gold/20 text-navy px-2 py-1 rounded">{ar ? asset.nameAr : asset.nameEn}</span>
              </div>
              <p className="text-gray-400 text-xs mt-3">{ar ? 'تفاصيل السلسلة الكاملة ستُتاح في المرحلة الأولى' : 'Full lineage detail available in Phase 1'}</p>
            </div>
          )}
          {tab === 'usage' && (
            <div className="text-sm text-gray-500 space-y-3">
              <p className="font-medium text-gray-700">{ar ? 'إحصائيات الاستخدام (تجريبية)' : 'Usage Statistics (demo)'}</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: ar ? 'طلبات الوصول' : 'Access Requests', value: '14' },
                  { label: ar ? 'مستخدمون نشطون' : 'Active Consumers', value: '3' },
                  { label: ar ? 'تنزيلات الشهر' : 'Downloads / Month', value: '47' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-navy">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit for approval */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setToast(true)}
          className="bg-navy hover:bg-navy-light text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
        >
          {ar ? 'تقديم للموافقة' : 'Submit for Approval'}
        </button>
      </div>
    </div>
  );
}
