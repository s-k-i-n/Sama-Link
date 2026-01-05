import { test, expect } from '@playwright/test';

test.describe('Sama Link Smoke Tests', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sama Link/);
    await expect(page.locator('h1')).toContainText(/Confessions/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Se connecter');
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.locator('h2')).toContainText(/Connexion/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Commencer maintenant');
    await expect(page).toHaveURL(/.*\/auth\/register/);
    await expect(page.locator('h2')).toContainText(/Inscription/);
  });
});
