import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

const { Given, When, Then } = createBdd();

const SAUCE_USERNAME = process.env.SAUCE_USERNAME || 'standard_user';
const SAUCE_PASSWORD = process.env.SAUCE_PASSWORD || 'secret_sauce';

// @CT006 | @CT007 | @CT008 | @CT009 | @CT010 | @CT011 — Contexto compartilhado
Given('que estou logado como {string}', async ({ page }, _role: string) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(SAUCE_USERNAME, SAUCE_PASSWORD);
  await expect(page).toHaveURL(/inventory\.html/);
});

// @CT006 | @CT007 | @CT008 | @CT009 | @CT010 | @CT011
When('adiciono {string} ao carrinho', async ({ page }, productName: string) => {
  const dashboard = new DashboardPage(page);
  await dashboard.addProductToCart(productName);
});

// @CT006 | @CT007 | @CT008 | @CT009 | @CT010 | @CT011
When('vou ao carrinho', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goToCart();
  await expect(page).toHaveURL(/cart\.html/);
});

// @CT006 | @CT007 | @CT008 | @CT009 | @CT010
When('prossigo para o checkout', async ({ page }) => {
  const cart = new CartPage(page);
  await cart.proceedToCheckout();
  await expect(page).toHaveURL(/checkout-step-one/);
});

// @CT006 | @CT007 | @CT008 | @CT009 | @CT010
When(
  'preencho o formulário com nome {string}, sobrenome {string}, CEP {string}',
  async ({ page }, firstName: string, lastName: string, zipCode: string) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillForm(firstName, lastName, zipCode);
  }
);

// @CT006 | @CT007 | @CT008 | @CT009 | @CT010
When('continuo para o resumo do pedido', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.continue();
  // Only assert navigation when the step is expected to succeed (CT006, CT007)
  // For CT008-CT010 (missing fields), the error is asserted by the next Then step
});

// @CT006 | @CT007
When('finalizo o pedido', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.finish();
});

// @CT006 | @CT007 — Checkout completo exibe confirmação
Then(
  'devo ver a mensagem de confirmação {string}',
  async ({ page }, expectedMessage: string) => {
    const checkout = new CheckoutPage(page);
    const actual = await checkout.getConfirmationMessage();
    expect(actual).toBe(expectedMessage);
  }
);

// @CT008 | @CT009 | @CT010 — Checkout com dados inválidos exibe erro
Then(
  'devo ver um erro de checkout contendo {string}',
  async ({ page }, errorText: string) => {
    const checkout = new CheckoutPage(page);
    const actual = await checkout.getErrorMessage();
    expect(actual).toContain(errorText);
  }
);

// @CT011 — Remover produto do carrinho antes do checkout
When('removo {string} do carrinho', async ({ page }, productName: string) => {
  const cart = new CartPage(page);
  await cart.removeItem(productName);
});

// @CT011 — Carrinho vazio após remoção
Then('o carrinho deve estar vazio', async ({ page }) => {
  const cart = new CartPage(page);
  const items = await cart.getCartItems();
  expect(items).toHaveLength(0);
});
