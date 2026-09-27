import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { BASE_URL, VIEWPORT, OUT_DATA_DIR, OUT_SCREENS_DIR, SCREEN_PADDING_PX } from './config.mjs';

/** Launch a Playwright browser + fresh page at the standard viewport. */
export async function launch() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT, locale: 'es-MX' });
  const page = await context.newPage();
  return { browser, context, page };
}

/** Dismiss the LFPDPPP cookie banner if it appears. Idempotent. */
export async function dismissCookieBanner(page) {
  try {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /aceptar/i.test((b.textContent || '').trim()),
      );
      btn?.click();
    });
  } catch {}
}

/**
 * Two-step login flow. Fills email → Continuar → password → submit.
 * Awaits redirect to /dashboard.
 */
export async function loginAs(page, user) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await dismissCookieBanner(page);
  await page.fill('input[type="email"], input[placeholder*="correo" i]', user.email);
  await page.locator('form').evaluate((f) => f.requestSubmit());
  await page.waitForSelector('input[type="password"]', { timeout: 5000 });
  await page.fill('input[type="password"]', user.password);
  await page.locator('input[type="password"]').first().evaluate((el) => el.form?.requestSubmit());
  await page.waitForURL((url) => /\/dashboard/.test(url.toString()), { timeout: 10000 });
}

/** Take a full-viewport screenshot into guide/screens/. */
export async function shoot(page, filename) {
  const outPath = path.join(OUT_SCREENS_DIR, filename);
  await page.screenshot({ path: outPath, fullPage: false });
  return `screens/${filename}`;
}

/**
 * Given a step definition — { image, selectors: {a: 'css', b: 'css', ...}, labels: {a:{es}, b:{es}} } —
 * resolves each selector to a real bounding box on the current page and returns the
 * fully-baked annotations array in the pipeline's JSON shape.
 */
export async function captureAnnotations(page, step) {
  const annotations = [];
  for (const [letter, sel] of Object.entries(step.selectors || {})) {
    const box = await page.locator(sel).first().boundingBox().catch(() => null);
    if (!box) {
      console.warn(`  [skip] annotation ${letter}: selector not found → ${sel}`);
      continue;
    }
    const label = step.labels?.[letter] ?? { es: letter };
    annotations.push({
      letter,
      box: padBox(box, SCREEN_PADDING_PX),
      selector: sel,
      labelEs: label.es,
      descEs: label.desc || null,
      color: label.color || null,
    });
  }
  return annotations;
}

function padBox(b, pad) {
  return {
    x: Math.max(0, Math.round(b.x - pad)),
    y: Math.max(0, Math.round(b.y - pad)),
    w: Math.round(b.width + pad * 2),
    h: Math.round(b.height + pad * 2),
  };
}

/**
 * Write a flow's `{title, steps: [...]}` payload to guide/data/<slug>.json.
 * Overwrites atomically.
 */
export async function writeFlow(slug, payload) {
  await fs.mkdir(OUT_DATA_DIR, { recursive: true });
  const out = path.join(OUT_DATA_DIR, `${slug}.json`);
  await fs.writeFile(out, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`  wrote ${out}`);
}

/** Convenience: run a whole flow definition. Each step yields a screenshot + annotations. */
export async function runFlow({ slug, title, roleAudience, steps }, page) {
  console.log(`\n== flow: ${slug} ==`);
  const outSteps = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`  step ${i + 1}: ${step.title}`);
    if (step.setup) await step.setup(page);
    await page.waitForTimeout(step.waitMs ?? 400);
    await dismissCookieBanner(page);
    const filename = `${slug}-${String(i + 1).padStart(2, '0')}.png`;
    const image = await shoot(page, filename);
    const annotations = await captureAnnotations(page, step);
    outSteps.push({
      n: i + 1,
      title: step.title,
      descEs: step.descEs || null,
      image,
      annotations,
    });
  }
  await writeFlow(slug, { slug, title, roleAudience: roleAudience || 'admin', steps: outSteps });
}
