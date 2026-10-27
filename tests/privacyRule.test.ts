import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePrivacyRule } from '../src/governance/privacyRule.ts';
import { DEMO_ASSETS } from '../src/data/assets.ts';

const base = { classification: 'Public', status: 'Published', pipelineStepsCompleted: 7 } as const;

test('public assets have no privacy restriction at any stage', () => {
  for (const status of ['Draft', 'Reviewed', 'Approved', 'Published'] as const) {
    assert.deepEqual(evaluatePrivacyRule({ ...base, status, pipelineStepsCompleted: 0 }), { verdict: 'ok', reasons: [] });
  }
});

test('restricted data cannot be published', () => {
  const result = evaluatePrivacyRule({ classification: 'Restricted', status: 'Published', pipelineStepsCompleted: 7 });
  assert.equal(result.verdict, 'blocked');
  assert.deepEqual(result.reasons, ['Restricted data cannot be published.']);
});

test('confidential draft needs no privacy review yet', () => {
  assert.deepEqual(
    evaluatePrivacyRule({ classification: 'Confidential', status: 'Draft', pipelineStepsCompleted: 1 }),
    { verdict: 'ok', reasons: [] },
  );
});

test('confidential asset past draft without privacy review needs review', () => {
  const result = evaluatePrivacyRule({ classification: 'Confidential', status: 'Reviewed', pipelineStepsCompleted: 1 });
  assert.equal(result.verdict, 'needs_review');
  assert.equal(result.reasons.length, 1);
});

test('restricted asset past draft without privacy review needs review', () => {
  const result = evaluatePrivacyRule({ classification: 'Restricted', status: 'Approved', pipelineStepsCompleted: 1 });
  assert.equal(result.verdict, 'needs_review');
});

test('confidential asset published without legal approval needs review', () => {
  const result = evaluatePrivacyRule({ classification: 'Confidential', status: 'Published', pipelineStepsCompleted: 5 });
  assert.equal(result.verdict, 'needs_review');
  assert.deepEqual(result.reasons, ['Confidential data needs legal and governance approval before publication.']);
});

test('confidential asset published with legal approval is ok', () => {
  assert.deepEqual(
    evaluatePrivacyRule({ classification: 'Confidential', status: 'Published', pipelineStepsCompleted: 6 }),
    { verdict: 'ok', reasons: [] },
  );
});

test('a confidential asset that skipped privacy review and is published reports both reasons', () => {
  const result = evaluatePrivacyRule({ classification: 'Confidential', status: 'Published', pipelineStepsCompleted: 1 });
  assert.equal(result.verdict, 'needs_review');
  assert.equal(result.reasons.length, 2);
});

test('no demo asset is flagged by the privacy rule', () => {
  for (const asset of DEMO_ASSETS) {
    assert.equal(evaluatePrivacyRule(asset).verdict, 'ok', `asset ${asset.id} ${asset.nameEn}`);
  }
});
