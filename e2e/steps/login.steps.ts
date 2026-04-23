import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

const { Given, When, Then } = createBdd();

// @CT001 | @CT002 — Contexto compartilhado
Given('que estou na página de login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
});

// @CT001 | @CT002 | @CT003 | @CT004 | @CT005
When(
  'faço login com usuário {string} e senha {string}',
  async ({ page }, username: string, password: string) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);
  }
);

// @CT001 — Login bem-sucedido redireciona para o painel
Then('devo estar no painel', async ({ page }) => {
  await expect(page).toHaveURL(/inventory\.html/);
});

// @CT002 — Login bem-sucedido exibe o título Produtos
Then('o título da página deve ser {string}', async ({ page }, title: string) => {
  const dashboard = new DashboardPage(page);
  const actual = await dashboard.getTitle();
  expect(actual).toBe(title);
});

// @CT003 | @CT004 | @CT005 — Login com credenciais inválidas / campos obrigatórios
Then(
  'devo ver uma mensagem de erro contendo {string}',
  async ({ page }, errorText: string) => {
    const loginPage = new LoginPage(page);
    const message = await loginPage.getErrorMessage();
    expect(message).toContain(errorText);
  }
);
