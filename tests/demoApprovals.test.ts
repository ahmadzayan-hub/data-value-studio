import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRIVACY_EXAMPLES } from '../src/data/assets.ts';
import { saveDemoApproval } from '../src/governance/demoApprovals.ts';

test('the request store refuses an ineligible asset before accessing browser storage', async () => {
  const blocked = PRIVACY_EXAMPLES.find(asset => asset.id === 'privacy-blocked');
  assert.ok(blocked);
  assert.equal(await saveDemoApproval(blocked), undefined);
});
