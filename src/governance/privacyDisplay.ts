import type { PrivacyVerdict } from './privacyRule';

// Arabic text for the exact reason strings produced by evaluatePrivacyRule.
// Unknown reasons fall back to the English text, so a new rule never renders blank.
const REASONS_AR: Record<string, string> = {
  'Restricted data cannot be published.': 'لا يمكن نشر البيانات المقيّدة.',
  'Confidential or Restricted data needs a completed privacy review before leaving Draft.':
    'تحتاج البيانات السرية أو المقيّدة إلى مراجعة خصوصية مكتملة قبل مغادرة حالة المسودة.',
  'Confidential data needs legal and governance approval before publication.':
    'تحتاج البيانات السرية إلى موافقة قانونية وموافقة الحوكمة قبل النشر.',
};

export function reasonText(reason: string, ar: boolean): string {
  return ar ? REASONS_AR[reason] ?? reason : reason;
}

export const VERDICT_LABELS: Record<PrivacyVerdict, { en: string; ar: string; classes: string }> = {
  ok: { en: 'Privacy check passed', ar: 'اجتاز فحص الخصوصية', classes: 'bg-green-50 border-green-200 text-green-800' },
  needs_review: { en: 'Needs review', ar: 'يحتاج إلى مراجعة', classes: 'bg-amber-50 border-amber-200 text-amber-800' },
  blocked: { en: 'Blocked', ar: 'محظور', classes: 'bg-red-50 border-red-200 text-red-800' },
};
