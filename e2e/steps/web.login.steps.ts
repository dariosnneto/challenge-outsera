import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

const { Given, When, Then } = createBdd();

Given('que estou na página de login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
});

When(
  'faço login com usuário {string} e senha {string}',
  async ({ page }, username: string, password: string) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);
  }
);

Then('devo estar no painel', async ({ page }) => {
  await expect(page).toHaveURL(/inventory\.html/);
});

Then('o título da página deve ser {string}', async ({ page }, title: string) => {
  const dashboard = new DashboardPage(page);
  const actual = await dashboard.getTitle();
  expect(actual).toBe(title);
});

Then(
  'devo ver uma mensagem de erro contendo {string}',
  async ({ page }, errorText: string) => {
    const loginPage = new LoginPage(page);
    const message = await loginPage.getErrorMessage();
    expect(message).toContain(errorText);
  }
);
