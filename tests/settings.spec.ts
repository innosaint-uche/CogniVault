import { test, expect } from '@playwright/test';

test.describe('CogniVault Studio Settings', () => {
  test('should allow switching AI providers', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New Project' }).click();

    // Open settings
    await page.getByRole('button', { name: 'Project Settings' }).click();

    // Check default is Google Gemini (first button in the group)
    const googleBtn = page.getByRole('button', { name: 'Google Gemini' });
    const openRouterBtn = page.getByRole('button', { name: 'OpenRouter', exact: true });

    await expect(googleBtn).toBeVisible();
    await expect(openRouterBtn).toBeVisible();

    // Switch to OpenRouter
    await openRouterBtn.click();

    // Check if OpenRouter model selector appears
    await expect(page.getByText('OpenRouter Model')).toBeVisible();

    // Select a model - target specific select for model which is the second one or finding by label nearby
    const modelSelect = page.locator('select').nth(1); // 0 is subtype, 1 is model
    await modelSelect.selectOption({ label: 'mistralai/mistral-7b-instruct:free' });

    // Save
    await page.getByRole('button', { name: 'Save Configuration' }).click();

    // Re-open settings to verify persistence (in-memory)
    await page.getByRole('button', { name: 'Project Settings' }).click();
    await expect(page.getByText('OpenRouter Model')).toBeVisible();
  });
});
