import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_ASSETS } from '../src/data/assets.ts';
import { evaluatePrivacyRule } from '../src/governance/privacyRule.ts';
import { reasonText, VERDICT_LABELS } from '../src/governance/privacyDisplay.ts';

test('every reason the rule can produce has an Arabic translation', () => {
  const inputs = [
    { classification: 'Restricted', status: 'Published', pipelineStepsCompleted: 7 },
    { classification: 'Confidential', status: 'Reviewed', pipelineStepsCompleted: 0 },
    { classification: 'Confidential', status: 'Published', pipelineStepsCompleted: 3 },
  ] as const;
  for (const input of inputs) {
    for (const reason of evaluatePrivacyRule(input).reasons) {
      assert.notEqual(reasonText(reason, true), reason, `missing Arabic for: ${reason}`);
      assert.equal(reasonText(reason, false), reason);
    }
  }
});

test('unknown reasons fall back to the original text', () => {
  assert.equal(reasonText('Something new.', true), 'Something new.');
});

test('every verdict has a label in both languages', () => {
  for (const v of ['ok', 'needs_review', 'blocked'] as const) {
    assert.ok(VERDICT_LABELS[v].en && VERDICT_LABELS[v].ar && VERDICT_LABELS[v].classes);
  }
});

test('demo assets all evaluate without throwing', () => {
  for (const a of DEMO_ASSETS) assert.ok(['ok', 'needs_review', 'blocked'].includes(evaluatePrivacyRule(a).verdict));
});
