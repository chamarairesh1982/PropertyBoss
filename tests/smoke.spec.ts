import { test, expect } from '@playwright/test';

test('home page loads and displays heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /find your next home/i })).toBeVisible();
});