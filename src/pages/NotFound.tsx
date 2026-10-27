import { useNavigate } from 'react-router-dom';

interface Props { lang: 'ar' | 'en' }

export function NotFound({ lang }: Props) {
  const navigate = useNavigate();
  const ar = lang === 'ar';
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="text-7xl font-black text-gold">404</div>
      <h2 className="text-xl font-bold text-navy">{ar ? 'الصفحة غير موجودة' : 'Page Not Found'}</h2>
      <p className="text-gray-400 text-sm max-w-xs">
        {ar ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.' : 'The page you are looking for does not exist or has been moved.'}
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-2 bg-navy text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-navy-light transition-colors"
      >
        {ar ? 'العودة للرئيسية' : 'Back to Home'}
      </button>
    </div>
  );
}
