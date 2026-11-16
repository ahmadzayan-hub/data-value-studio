import type { DataAsset } from '../data/assets';
import { evaluatePrivacyRule, PRIVACY_RULE_VERSION, type PrivacyVerdict } from './privacyRule.ts';

const REQUESTS = 'approvalRequests';

export interface DemoApprovalRequest {
  assetId: string;
  requestedAt: string;
  ruleVersion: string;
  verdict: Exclude<PrivacyVerdict, 'blocked'>;
  reasons: string[];
}

async function accessRequest(assetId: string, candidate?: DemoApprovalRequest) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const opening = indexedDB.open('data-value-studio-demo', 1);
    opening.onupgradeneeded = () => {
      opening.result.createObjectStore(REQUESTS, { keyPath: 'assetId' });
    };
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () => reject(opening.error);
  });

  try {
    return await new Promise<DemoApprovalRequest | undefined>((resolve, reject) => {
      const transaction = database.transaction(REQUESTS, candidate ? 'readwrite' : 'readonly');
      const store = transaction.objectStore(REQUESTS);
      const lookup = store.get(assetId);
      let saved: DemoApprovalRequest | undefined;

      lookup.onsuccess = () => {
        saved = lookup.result as DemoApprovalRequest | undefined;
        if (saved === undefined && candidate) {
          store.add(candidate);
          saved = candidate;
        }
      };
      transaction.oncomplete = () => resolve(saved);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export function readDemoApproval(assetId: string) {
  return accessRequest(assetId);
}

export async function saveDemoApproval(asset: DataAsset) {
  const { verdict, reasons } = evaluatePrivacyRule(asset);
  if (verdict === 'blocked') return undefined;

  return accessRequest(asset.id, {
    assetId: asset.id,
    requestedAt: new Date().toISOString(),
    ruleVersion: PRIVACY_RULE_VERSION,
    verdict,
    reasons,
  });
}
