import { test, expect } from '@playwright/test';

async function expectWindowFit(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => {
    window.scrollTo(1000, 1000);
    return {
      width: innerWidth,
      height: innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      bodyWidth: document.body.scrollWidth,
      bodyHeight: document.body.scrollHeight,
      rootHeight: document.getElementById('root')!.getBoundingClientRect()
        .height,
      scrollX,
      scrollY,
    };
  });
  expect(dimensions.documentWidth).toBe(dimensions.width);
  expect(dimensions.documentHeight).toBe(dimensions.height);
  expect(dimensions.bodyWidth).toBe(dimensions.width);
  expect(dimensions.bodyHeight).toBe(dimensions.height);
  expect(dimensions.rootHeight).toBe(dimensions.height);
  expect(dimensions.scrollX).toBe(0);
  expect(dimensions.scrollY).toBe(0);
  return dimensions;
}

test('fenêtre entière, sans scroll global : desktop, tablette, téléphone et paysage', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('heading', { name: 'Tokens sémantiques' }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  const measurements = [];
  for (const [width, height] of [
    [1920, 1080],
    [1600, 1100],
    [1440, 900],
    [1366, 768],
    [1280, 720],
    [1100, 700],
    [1099, 800],
    [1024, 768],
    [700, 900],
    [375, 812],
    [320, 568],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    measurements.push(await expectWindowFit(page));
    await expect(page.locator('#ds-panel')).toBeVisible();
    await expect(page.locator('#agent-panel')).toBeVisible({
      visible: width >= 1100,
    });
    await expect(page.locator('#mobile-panel')).toBeVisible({
      visible: width >= 1100,
    });
    const panel = await page.locator('#ds-panel').boundingBox();
    expect(panel!.y + panel!.height).toBeLessThanOrEqual(height);
    if ([1440, 375, 844].includes(width)) {
      await page.screenshot({
        path: info.outputPath(`workspace-${width}x${height}.png`),
      });
    }
  }
  await info.attach('fullscreen-measurements', {
    body: JSON.stringify(measurements, null, 2),
    contentType: 'application/json',
  });
  expect(errors).toEqual([]);
});

test('scroll strictement local et viewport réel : largeur desktop accessible sans déplacer la page', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const stage = page.locator('.viewport-scroll');
  await expect
    .poll(() => stage.evaluate((el) => el.scrollHeight - el.clientHeight))
    .toBe(0);
  const scroll = page.locator('.ds-scroll');
  await scroll.hover();
  await page.mouse.wheel(0, 650);
  await expect
    .poll(() => scroll.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await expectWindowFit(page);
  // Le dernier composant doit rester accessible, pas seulement être masqué par overflow:hidden.
  await page.locator('.catalogue .ds-nav').scrollIntoViewIfNeeded();
  await page
    .locator('.catalogue')
    .getByRole('button', { name: 'Profil', exact: true })
    .click();
  await expect(
    page
      .locator('.catalogue')
      .getByText('Votre espace personnel de démonstration.'),
  ).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Viewport', exact: true })
    .selectOption('3');
  await stage.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
  });
  await expect
    .poll(() => stage.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  expect(
    await page
      .locator('iframe')
      .evaluate((el: HTMLIFrameElement) => el.contentWindow!.innerWidth),
  ).toBe(1024);
  await expectWindowFit(page);
});

test('petit écran : trois panneaux accessibles, brouillon conservé et historique modal au clavier', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByLabel('Valeur du token').fill('#704020');
  const nav = page.getByRole('navigation', { name: 'Panneaux de l’atelier' });
  await nav.getByRole('button', { name: /Agent/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Agent', exact: true }),
  ).toBeFocused();
  await page.getByText('Mon PFE · brief privé', { exact: true }).click();
  await expect(page.getByLabel('Nom du PFE', { exact: true })).toBeVisible();
  await expectWindowFit(page);
  await page.getByRole('link', { name: 'Aller aux tokens' }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Design System', exact: true }),
  ).toBeFocused();
  await nav.getByRole('button', { name: /Aperçu/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Aperçu responsive' }),
  ).toBeFocused();
  await page
    .getByRole('combobox', { name: 'Viewport', exact: true })
    .selectOption('0');
  await page.screenshot({ path: info.outputPath('preview-mobile.png') });
  await nav.getByRole('button', { name: /Design System/ }).click();
  await expect(page.getByLabel('Valeur du token')).toHaveValue('#704020');
  await page.getByRole('button', { name: 'Proposer', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Ne pas appliquer' }),
  ).toBeFocused();
  await page.screenshot({ path: info.outputPath('diff-mobile.png') });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Historique/ }).click();
  await expect(
    page.getByRole('dialog', { name: 'Historique des changements' }),
  ).toBeVisible();
  await expectWindowFit(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: /Historique/ })).toBeFocused();
  await expectWindowFit(page);
});

test('composants partagés : focus, hover, désactivé et validation native du formulaire', async ({
  page,
}) => {
  await page.goto('/');
  const main = page
    .locator('.catalogue')
    .getByRole('button', { name: 'Action principale', exact: true });
  await main.hover();
  await expect(main).toHaveCSS('background-color', 'rgb(36, 63, 153)');
  await main.focus();
  await page.keyboard.press('Tab');
  const secondary = page
    .locator('.catalogue')
    .getByRole('button', { name: 'Secondaire', exact: true });
  await expect(secondary).toBeFocused();
  await expect(secondary).toHaveCSS('outline-style', 'solid');
  await expect(
    page.locator('.catalogue').getByRole('button', { name: 'Indisponible' }),
  ).toBeDisabled();
  await page
    .getByRole('combobox', { name: 'Scénario', exact: true })
    .selectOption('form');
  const frame = page.frameLocator('iframe');
  await frame.getByRole('button', { name: 'S’inscrire', exact: true }).click();
  expect(
    await frame
      .locator('form')
      .evaluate((el: HTMLFormElement) => el.checkValidity()),
  ).toBe(false);
  await expect(
    frame.getByText(/Merci ! Démonstration locale/),
  ).not.toBeVisible();
  await expect(frame.getByPlaceholder('Non disponible')).toBeDisabled();
  await expectWindowFit(page);
});
