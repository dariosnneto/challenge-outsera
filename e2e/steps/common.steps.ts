import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const { Given } = createBdd();

// Step de contexto compartilhado entre features que exigem usuário autenticado.
// As credenciais vêm exclusivamente do .env — sem fallback hardcoded.
Given('que estou logado como {string}', async ({ page }, _role: string) => {
  const username = process.env.SAUCE_USERNAME;
  const password = process.env.SAUCE_PASSWORD;
  if (!username || !password) {
    throw new Error('SAUCE_USERNAME e SAUCE_PASSWORD devem estar definidos no .env');
  }
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(username, password);
  await expect(page).toHaveURL(/inventory\.html/);
});
