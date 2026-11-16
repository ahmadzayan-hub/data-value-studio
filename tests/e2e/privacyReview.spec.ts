import { expect, test } from '@playwright/test';
import type { DataAsset } from '../../src/data/assets';
import type { PrivacyVerdict } from '../../src/governance/privacyRule';

const baseAsset = {
  status: 'Published',
  qualityScore: 80,
  owner: 'QA',
  lastUpdated: '2026-11-01',
  descriptionEn: 'Synthetic asset for privacy review testing.',
  descriptionAr: 'أصل اصطناعي لاختبار مراجعة الخصوصية.',
} as const;

const cases = [
  {
    verdict: 'ok',
    asset: {
      ...baseAsset,
      id: 'privacy-ok',
      nameEn: 'Synthetic public asset',
      nameAr: 'أصل عام اصطناعي',
      classification: 'Public',
      pipelineStepsCompleted: 7,
    },
    label: { en: 'Privacy check passed', ar: 'اجتاز فحص الخصوصية' },
    reasons: { en: [], ar: [] },
  },
  {
    verdict: 'needs_review',
    asset: {
      ...baseAsset,
      id: 'privacy-needs-review',
      nameEn: 'Synthetic confidential asset',
      nameAr: 'أصل سري اصطناعي',
      classification: 'Confidential',
      pipelineStepsCompleted: 1,
    },
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
  },
  {
    verdict: 'blocked',
    asset: {
      ...baseAsset,
      id: 'privacy-blocked',
      nameEn: 'Synthetic restricted asset',
      nameAr: 'أصل مقيّد اصطناعي',
      classification: 'Restricted',
      pipelineStepsCompleted: 7,
    },
    label: { en: 'Blocked', ar: 'محظور' },
    reasons: {
      en: ['Restricted data cannot be published.'],
      ar: ['لا يمكن نشر البيانات المقيّدة.'],
    },
  },
] satisfies Array<{
  verdict: PrivacyVerdict;
  asset: DataAsset;
  label: Record<'ar' | 'en', string>;
  reasons: Record<'ar' | 'en', string[]>;
}>;

const copy = {
  ar: {
    direction: 'rtl',
    panel: 'مراجعة الخصوصية',
    action: 'تقديم للموافقة',
    confirmation: 'تم إرسال طلب الموافقة بنجاح',
  },
  en: {
    direction: 'ltr',
    panel: 'Privacy review',
    action: 'Submit for Approval',
    confirmation: 'Approval request submitted successfully',
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

test.beforeEach(async ({ page }) => {
  // Add records to the real Vite module for this browser page only.
  const assets = cases.map(scenario => scenario.asset);
  await page.route('**/src/data/assets.ts', async route => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: `${await response.text()}\nDEMO_ASSETS.push(...${JSON.stringify(assets)});\n`,
    });
  });
});

for (const lang of ['ar', 'en'] as const) {
  for (const scenario of cases) {
    test(`${lang} ${scenario.verdict} renders the decision and approval action`, async ({ page }, testInfo) => {
      const labels = copy[lang];
      await page.goto(`/asset/${scenario.asset.id}`);
      if (lang === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();

      const root = page.locator('html');
      await expect(root).toHaveAttribute('lang', lang);
      await expect(root).toHaveAttribute('dir', labels.direction);
      await expect(page.getByRole('heading', {
        level: 1, name: lang === 'ar' ? scenario.asset.nameAr : scenario.asset.nameEn, exact: true,
      })).toBeVisible();

      const panel = page.getByTestId('privacy-review');
      const heading = panel.getByRole('heading', {
        name: `${labels.panel}: ${scenario.label[lang]}`, exact: true,
      });
      const reasons = panel.getByRole('listitem');
      const approval = page.getByRole('button', { name: labels.action, exact: true });
      await expect(heading).toBeVisible();
      await expect(panel).toBeInViewport({ ratio: 1 });
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
      const typography = await heading.or(reasons).evaluateAll(elements => elements.map(element => {
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

      const blocked = scenario.verdict === 'blocked';
      await expect(approval).toHaveJSProperty('disabled', blocked);
      // Force pointer input only on the disabled control to check it has no effect.
      const pointerOptions = { force: blocked };
      if (testInfo.project.use.hasTouch) {
        await approval.tap(pointerOptions);
      } else {
        await approval.click(pointerOptions);
      }

      const confirmation = page.getByText(labels.confirmation, { exact: true });
      if (blocked) {
        await expect(confirmation).toHaveCount(0);
      } else {
        await expect(confirmation).toBeVisible();
      }
    });
  }
}
