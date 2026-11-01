import type { DataAsset } from '../data/assets';

export type PrivacyVerdict = 'ok' | 'needs_review' | 'blocked';

export interface PrivacyEvaluation {
  verdict: PrivacyVerdict;
  reasons: string[];
}

type PrivacyInput = Pick<DataAsset, 'classification' | 'status' | 'pipelineStepsCompleted'>;

// Pipeline positions from PIPELINE_STEPS: 1 Classification, 2 Privacy & Security Review, 6 Legal & Governance Approval.
const PRIVACY_REVIEW_DONE = 2;
const LEGAL_APPROVAL_DONE = 6;

export const PRIVACY_RULE_VERSION = 'demo-privacy-v1';

export function evaluatePrivacyRule(asset: PrivacyInput): PrivacyEvaluation {
  const { classification, status, pipelineStepsCompleted } = asset;
  const reasons: string[] = [];

  if (classification === 'Public') {
    return { verdict: 'ok', reasons };
  }

  if (classification === 'Restricted' && status === 'Published') {
    reasons.push('Restricted data cannot be published.');
    return { verdict: 'blocked', reasons };
  }

  if (pipelineStepsCompleted < PRIVACY_REVIEW_DONE && status !== 'Draft') {
    reasons.push('Confidential or Restricted data needs a completed privacy review before leaving Draft.');
  }

  if (status === 'Published' && pipelineStepsCompleted < LEGAL_APPROVAL_DONE) {
    reasons.push('Confidential data needs legal and governance approval before publication.');
  }

  return { verdict: reasons.length > 0 ? 'needs_review' : 'ok', reasons };
}
