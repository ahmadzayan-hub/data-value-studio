import { expect, test, type Page } from '@playwright/test';
import type { DemoApprovalRequest } from '../../src/governance/demoApprovals';
import type { PrivacyVerdict } from '../../src/governance/privacyRule';

const cases = [
  {
    verdict: 'ok',
    id: 'privacy-ok',
    label: { en: 'Privacy check passed', ar: 'اجتاز فحص الخصوصية' },
    reasons: { en: [], ar: [] },
    next: { en: 'Save a demo request for governance review.', ar: 'يمكنك حفظ طلب تجريبي لمراجعة الحوكمة.' },
  },
  {
    verdict: 'needs_review',
    id: 'privacy-needs-review',
    label: { en: 'Needs review', ar: 'يحتاج إلى مراجعة' },
    reasons: {
      en: [
        'Confidential or Restricted data needs a completed privacy review before leaving Draft.',
        'Confidential data needs legal and governance approval before publication.',
      ],
      ar: [
        'تحتاج البيانات السرية أو المقيّدة إلى مراجعة خصوصية مكتملة قبل مغادرة حالة المسودة.',
        'تحتاج البيانات السرية إلى موافقة قانونية وموافقة الحوكمة قبل النشر.',
      ],
    },
    next: {
      en: 'You can save the request for review. Resolve the requirements above before approval.',
      ar: 'يمكنك حفظ الطلب للمراجعة. استكمل المتطلبات أعلاه قبل اتخاذ قرار الاعتماد.',
    },
  },
  {
    verdict: 'blocked',
    id: 'privacy-blocked',
    label: { en: 'Blocked', ar: 'محظور' },
    reasons: {
      en: ['Restricted data cannot be published.'],
      ar: ['لا يمكن نشر البيانات المقيّدة.'],
    },
    next: {
      en: 'Withdraw the restricted asset from publication or prepare an eligible derivative and reassess it.',
      ar: 'اسحب الأصل المقيّد من النشر أو جهّز مشتقًا مسموحًا للنشر وأعد تقييمه.',
    },
  },
] satisfies Array<{
  verdict: PrivacyVerdict;
  id: string;
  label: Record<'ar' | 'en', string>;
  reasons: Record<'ar' | 'en', string[]>;
  next: Record<'ar' | 'en', string>;
}>;

const copy = {
  ar: {
    direction: 'rtl',
    panel: 'مراجعة الخصوصية',
    action: 'حفظ طلب الموافقة',
    confirmation: 'قيد المراجعة التجريبية',
  },
  en: {
    direction: 'ltr',
    panel: 'Privacy review',
    action: 'Save approval request',
    confirmation: 'Pending demo review',
  },
};

// These controls use solid sRGB colors. Require the CSS colors to be opaque.
function luminance(color: string) {
  const rgb = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(color);
  if (!rgb) throw new Error(`Expected an opaque RGB color, received ${color}`);
  const [red, green, blue] = rgb.slice(1).map(channel => {
    const value = Number(channel) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(text: string, background: string) {
  const foreground = luminance(text);
  const backdrop = luminance(background);
  return (Math.max(foreground, backdrop) + 0.05) / (Math.min(foreground, backdrop) + 0.05);
}

function route(path: string) {
  return process.env.PLAYWRIGHT_PAGES_URL ? `./#${path}` : path;
}

function storedRequests(page: Page) {
  return page.evaluate(async () => {
    if (!(await indexedDB.databases()).some(database => database.name === 'data-value-studio-demo')) return [];

    return new Promise<DemoApprovalRequest[]>((resolve, reject) => {
      const opening = indexedDB.open('data-value-studio-demo', 1);
      opening.onerror = () => reject(opening.error);
      opening.onsuccess = () => {
        const database = opening.result;
        const tx = database.transaction('approvalRequests', 'readonly');
        const requests = tx.objectStore('approvalRequests').getAll();
        tx.oncomplete = () => {
          database.close();
          resolve(requests.result);
        };
        tx.onabort = () => {
          database.close();
          reject(tx.error);
        };
      };
    });
  });
}

for (const lang of ['ar', 'en'] as const) {
  for (const scenario of cases) {
    test(`${lang} ${scenario.verdict} renders the decision and approval action`, async ({ page }, testInfo) => {
      const labels = copy[lang];
      await page.goto(route(`/asset/${scenario.id}`));
      if (lang === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();

      const root = page.locator('html');
      await expect(root).toHaveAttribute('lang', lang);
      await expect(root).toHaveAttribute('dir', labels.direction);
      const panel = page.getByTestId('privacy-review');
      const heading = panel.getByRole('heading', {
        name: `${labels.panel}: ${scenario.label[lang]}`, exact: true,
      });
      const reasons = panel.getByRole('listitem');
      const guidance = panel.getByText(scenario.next[lang], { exact: true });
      const approval = panel.getByRole('button', { name: labels.action, exact: true });
      const blocked = scenario.verdict === 'blocked';
      await expect(heading).toBeVisible();
      await expect(panel).toBeInViewport({ ratio: 1 });
      await expect(guidance).toBeVisible();
      await expect(approval).toHaveAccessibleDescription(scenario.next[lang]);
      await expect(approval).toHaveJSProperty('disabled', blocked);
      await expect(reasons).toHaveCount(scenario.reasons[lang].length);
      if (scenario.reasons[lang].length) {
        await expect(reasons).toHaveText(scenario.reasons[lang]);
        const list = panel.getByRole('list');
        await expect(list).toHaveCSS('direction', labels.direction);
        const indent = await list.evaluate(element => {
          const { direction, paddingLeft, paddingRight } = getComputedStyle(element);
          const difference = parseFloat(paddingLeft) - parseFloat(paddingRight);
          return direction === 'rtl' ? -difference : difference;
        });
        expect(indent, 'list markers have space on the reading start side').toBeGreaterThan(0);
      }

      const layout = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(layout.viewport).toBe(page.viewportSize()?.width);
      expect(layout.content, 'page has no horizontal overflow').toBe(layout.viewport);

      const panelBackground = await panel.evaluate(element => getComputedStyle(element).backgroundColor);
      const typography = await heading.or(reasons).or(guidance).evaluateAll(elements => elements.map(element => {
        const { color, direction, fontSize, lineHeight } = getComputedStyle(element);
        return { color, direction, size: parseFloat(fontSize), lineHeight: parseFloat(lineHeight) };
      }));
      for (const text of typography) {
        expect(text.direction).toBe(labels.direction);
        expect.soft(text.size, 'privacy text size in CSS px').toBeGreaterThanOrEqual(16);
        expect.soft(text.lineHeight / text.size, 'privacy text line spacing').toBeGreaterThanOrEqual(1.5);
        expect(contrast(text.color, panelBackground), 'privacy text contrast').toBeGreaterThanOrEqual(4.5);
      }

      const buttonColors = await approval.evaluate(element => {
        const { color, backgroundColor, opacity } = getComputedStyle(element);
        return { color, backgroundColor, opacity };
      });
      const buttonContrast = contrast(buttonColors.color, buttonColors.backgroundColor);
      expect.soft(buttonColors.opacity, 'approval label has no opacity reduction').toBe('1');
      expect(buttonContrast, 'approval label contrast').toBeGreaterThanOrEqual(4.5);

      if (process.env.PRIVACY_SCREENSHOTS === '1') {
        const screenshot = testInfo.outputPath('privacy.png');
        await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
        await testInfo.attach('readability', {
          body: JSON.stringify({ layout, typography, panelBackground, buttonColors }),
          contentType: 'application/json',
        });
      }

      await approval.scrollIntoViewIfNeeded();
      await expect(approval).toBeInViewport({ ratio: 1 });

      // Force pointer input only on the disabled control to check it has no effect.
      const pointerOptions = { force: blocked };
      if (testInfo.project.use.hasTouch) {
        await approval.tap(pointerOptions);
      } else {
        await approval.click(pointerOptions);
      }

      const receipt = panel.getByRole('status');
      if (blocked) {
        await expect(receipt).toHaveCount(0);
        expect(await storedRequests(page)).toEqual([]);
      } else {
        await expect(receipt.getByText(labels.confirmation, { exact: true })).toBeVisible();
        const timestamp = await receipt.locator('time').getAttribute('datetime') ?? '';
        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(await storedRequests(page)).toEqual([{
          assetId: scenario.id,
          requestedAt: timestamp,
          ruleVersion: 'demo-privacy-v1',
          verdict: scenario.verdict,
          reasons: scenario.reasons.en,
        }]);
        await page.reload();
        if (lang === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
        await expect(receipt.getByText(labels.confirmation, { exact: true })).toBeVisible();
        await expect(receipt.locator('time')).toHaveAttribute('datetime', timestamp);
        await expect(approval).toHaveCount(0);
        if (scenario.verdict === 'needs_review') await expect(guidance).toBeVisible();
      }
    });
  }
}

test('concurrent requests from two tabs keep the same saved record', async ({ page, context }) => {
  const anotherTab = await context.newPage();
  const assetRoute = route('/asset/privacy-ok');
  await Promise.all([page.goto(assetRoute), anotherTab.goto(assetRoute)]);
  const actions = [page, anotherTab].map(tab => tab.getByRole('button', { name: copy.ar.action, exact: true }));
  await Promise.all(actions.map(action => expect(action).toBeEnabled()));
  await Promise.all(actions.map(action => action.click()));

  const receipts = [page, anotherTab].map(tab => tab.getByRole('status'));
  for (const receipt of receipts) await expect(receipt.getByText(copy.ar.confirmation)).toBeVisible();
  const records = await storedRequests(page);
  expect(records).toHaveLength(1);
  for (const receipt of receipts) {
    await expect(receipt.locator('time')).toHaveAttribute('datetime', records[0].requestedAt);
  }
});

test('storage errors show a retry without a saved request', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      get() { throw new DOMException('Storage unavailable', 'SecurityError'); },
    });
  });
  await page.goto(route('/asset/privacy-ok'));
  const action = page.getByRole('button', { name: copy.ar.action });
  await expect(page.getByRole('alert')).toContainText('تعذّر حفظ الطلب');
  await action.click();
  await expect(page.getByRole('alert')).toContainText('تعذّر حفظ الطلب');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(action).toBeEnabled();
});

test('an aborted storage transaction leaves no receipt or partial record', async ({ page }) => {
  await page.addInitScript(() => {
    const add = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function (value, key) {
      const writing = add.call(this, value, key);
      this.transaction.abort();
      return writing;
    };
  });
  await page.goto(route('/asset/privacy-ok'));
  const action = page.getByRole('button', { name: copy.ar.action });
  await action.click();
  await expect(page.getByRole('alert')).toContainText('تعذّر حفظ الطلب');
  await expect(page.getByRole('status')).toHaveCount(0);
  expect(await storedRequests(page)).toEqual([]);
  await expect(action).toBeEnabled();
});

test('inventory links to each privacy example and invalid asset links show the fallback', async ({ page }) => {
  await page.goto(route('/inventory'));
  const examples = page.getByRole('region', { name: 'جرّب مراجعة الخصوصية' });
  await expect(examples.getByRole('link')).toHaveCount(3);
  await examples.getByRole('link', { name: 'أصل مقيّد اصطناعي' }).click();
  await expect(page.getByRole('heading', { name: 'مراجعة الخصوصية: محظور' })).toBeVisible();
  await page.goto(route('/asset/unknown'));
  await expect(page.getByRole('heading', { name: 'الصفحة غير موجودة' })).toBeVisible();
});
