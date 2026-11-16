import { useEffect, useState } from 'react';
import type { DataAsset } from '../data/assets';
import { readDemoApproval, saveDemoApproval, type DemoApprovalRequest } from '../governance/demoApprovals';
import { reasonText, VERDICT_LABELS } from '../governance/privacyDisplay';
import { evaluatePrivacyRule, type PrivacyVerdict } from '../governance/privacyRule';

type RequestState =
  | { status: 'loading' | 'ready' | 'saving' | 'error' }
  | { status: 'saved'; request: DemoApprovalRequest };

const nextStep: Record<PrivacyVerdict, Record<'ar' | 'en', string>> = {
  ok: {
    ar: 'يمكنك حفظ طلب تجريبي لمراجعة الحوكمة.',
    en: 'Save a demo request for governance review.',
  },
  needs_review: {
    ar: 'يمكنك حفظ الطلب للمراجعة. استكمل المتطلبات أعلاه قبل اتخاذ قرار الاعتماد.',
    en: 'You can save the request for review. Resolve the requirements above before approval.',
  },
  blocked: {
    ar: 'اسحب الأصل المقيّد من النشر أو جهّز مشتقًا مسموحًا للنشر وأعد تقييمه.',
    en: 'Withdraw the restricted asset from publication or prepare an eligible derivative and reassess it.',
  },
};

export function PrivacyReview({ asset, lang }: { asset: DataAsset; lang: 'ar' | 'en' }) {
  const ar = lang === 'ar';
  const privacy = evaluatePrivacyRule(asset);
  const verdict = VERDICT_LABELS[privacy.verdict];
  const blocked = privacy.verdict === 'blocked';
  const [state, setState] = useState<RequestState>({ status: 'loading' });

  useEffect(() => {
    if (blocked) return;
    let active = true;
    readDemoApproval(asset.id).then(request => {
      if (active) setState(request ? { status: 'saved', request } : { status: 'ready' });
    }).catch(() => {
      if (active) setState({ status: 'error' });
    });
    return () => { active = false; };
  }, [asset.id, blocked]);

  async function saveRequest() {
    setState({ status: 'saving' });
    try {
      const request = await saveDemoApproval(asset);
      setState(request ? { status: 'saved', request } : { status: 'ready' });
    } catch {
      setState({ status: 'error' });
    }
  }

  return (
    <section
      aria-labelledby="privacy-review-heading"
      data-testid="privacy-review"
      className={`border rounded-2xl p-5 mb-6 ${verdict.classes}`}
    >
      <h2 id="privacy-review-heading" className="font-semibold mb-1">
        {ar ? 'مراجعة الخصوصية' : 'Privacy review'}: {verdict[lang]}
      </h2>
      {privacy.reasons.length > 0 && (
        <ul className="list-disc ps-5 text-base space-y-1">
          {privacy.reasons.map(reason => <li key={reason}>{reasonText(reason, ar)}</li>)}
        </ul>
      )}
      {(privacy.verdict !== 'ok' || state.status !== 'saved') && (
        <p id="approval-next-step" className="mt-4 font-medium">{nextStep[privacy.verdict][lang]}</p>
      )}
      {!blocked && state.status === 'saved' ? (
        <div role="status" className="mt-4 rounded-xl border border-current p-4">
          <p className="font-semibold">{ar ? 'قيد المراجعة التجريبية' : 'Pending demo review'}</p>
          <p className="mt-1 text-sm">{ar ? 'حُفظ الطلب على هذا المتصفح.' : 'Request saved in this browser.'}</p>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt>{ar ? 'وقت الطلب' : 'Requested on'}</dt>
              <dd>
                <time dateTime={state.request.requestedAt}>
                  {new Date(state.request.requestedAt).toLocaleString(ar ? 'ar-AE' : 'en-AE', {
                    dateStyle: 'medium', timeStyle: 'short',
                  })}
                </time>
              </dd>
            </div>
            <div>
              <dt>{ar ? 'إصدار قاعدة الخصوصية' : 'Privacy rule version'}</dt>
              <dd><bdi>{state.request.ruleVersion}</bdi></dd>
            </div>
          </dl>
        </div>
      ) : (
        <div>
          {state.status === 'error' && (
            <p role="alert" className="mt-2 text-red-800">
              {ar ? 'تعذّر حفظ الطلب في هذا المتصفح. حاول مجددًا.' : 'The request could not be saved in this browser. Try again.'}
            </p>
          )}
          <button
            type="button"
            onClick={saveRequest}
            disabled={blocked || state.status === 'loading' || state.status === 'saving'}
            aria-describedby="approval-next-step"
            className="mt-3 rounded-xl bg-navy px-5 py-3 font-semibold text-white transition-colors enabled:hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-600"
          >
            {state.status === 'saving'
              ? (ar ? 'جارٍ حفظ الطلب…' : 'Saving request…')
              : (ar ? 'حفظ طلب الموافقة' : 'Save approval request')}
          </button>
        </div>
      )}
    </section>
  );
}
