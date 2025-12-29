import { test, expect } from '@playwright/test';

test.describe('CogniVault Studio E2E', () => {
  test('should load the application and display the dashboard', async ({ page }) => {
    await page.goto('/');

    // Check for dashboard title
    await expect(page).toHaveTitle(/CogniVault Studio/);
    await expect(page.getByText('Studio v1.1')).toBeVisible();
    await expect(page.getByText('New Project')).toBeVisible();
  });

  test('should create a new project and verify default state', async ({ page }) => {
    await page.goto('/');

    // Create new project
    await page.getByRole('button', { name: 'New Project' }).click();

    // Now we should be in the editor view
    // Check for main heading in Sidebar
    await expect(page.getByRole('heading', { name: 'CogniVault' })).toBeVisible();

    // Check default mode is Logic Core
    await expect(page.getByRole('button', { name: 'LOGIC CORE' })).toBeVisible();

    // Check Outline tab is active by default
    const outlineTab = page.getByRole('button', { name: 'Outline', exact: true });
    await expect(outlineTab).toBeVisible();
    await expect(outlineTab).toHaveClass(/text-emerald-400/);
  });

  test('should create a new chapter', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New Project' }).click();

    // Check initial state
    await expect(page.getByText('Project is empty.')).toBeVisible();

    // Click "Add Chapter"
    await page.getByRole('button', { name: 'Add Chapter' }).click();

    // Verify a new chapter appears
    // Sidebar item
    const chapterInSidebar = page.locator('div.group', { hasText: 'Chapter 1' }).last();
    await expect(chapterInSidebar).toBeVisible();

    await expect(page.getByText('Project is empty.')).not.toBeVisible();

    // Verify it is selected (has border color)
    await expect(chapterInSidebar).toHaveClass(/bg-slate-800/);
  });

  test('should switch modes', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'New Project' }).click();

      const logicBtn = page.getByRole('button', { name: 'LOGIC CORE' });
      const neuralBtn = page.getByRole('button', { name: 'NEURAL LINK' });

      // Default Logic
      await expect(logicBtn).toHaveClass(/bg-emerald-500\/10/);

      // Switch to Neural
      await neuralBtn.click();
      await expect(neuralBtn).toHaveClass(/bg-cyan-500\/10/);
      await expect(logicBtn).not.toHaveClass(/bg-emerald-500\/10/);
  });

  test('should switch tabs in sidebar', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'New Project' }).click();

      const sourcesTab = page.getByRole('button', { name: 'Sources' });

      await sourcesTab.click();

      // Check if Ingest Document button is visible
      await expect(page.getByRole('button', { name: 'Ingest Document' })).toBeVisible();
  });
});
