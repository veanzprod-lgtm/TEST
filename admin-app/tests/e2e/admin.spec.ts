import { test, expect } from '@playwright/test';

const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD ?? 'supersecret';

test('login and update site content', async ({ page }) => {
  await page.route('**/api/content?path=site.json', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            name: 'Studio',
            baseline: 'Baseline',
            email: adminEmail,
            phone: '+33 1 23 45 67 89',
            offices: [{ city: 'Paris', address: '1 rue de Paris' }],
            socials: [{ name: 'LinkedIn', url: 'https://linkedin.com' }],
            clients: ['Client']
          },
          sha: 'fake-sha'
        }),
        headers: { 'content-type': 'application/json' }
      });
    } else if (method === 'PUT') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ ok: true }),
        headers: { 'content-type': 'application/json' }
      });
    } else {
      await route.fallback();
    }
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill(adminEmail);
  await page.getByLabel('Mot de passe').fill(adminPassword);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();

  await page.goto('/site');
  await expect(page.getByRole('heading', { name: 'Site' })).toBeVisible();

  const baselineField = page.getByLabel('Baseline');
  await baselineField.fill('Nouvelle baseline test');
  await page.getByRole('button', { name: 'Sauvegarder' }).click();

  await expect(page.getByText('Contenu sauvegardé')).toBeVisible();
});
