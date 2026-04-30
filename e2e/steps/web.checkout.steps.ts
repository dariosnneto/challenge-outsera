import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

const { When, Then } = createBdd();

When('adiciono {string} ao carrinho', async ({ page }, productName: string) => {
  const dashboard = new DashboardPage(page);
  await dashboard.addProductToCart(productName);
});

When('vou ao carrinho', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goToCart();
  await expect(page).toHaveURL(/cart\.html/);
});

When('prossigo para o checkout', async ({ page }) => {
  const cart = new CartPage(page);
  await cart.proceedToCheckout();
  await expect(page).toHaveURL(/checkout-step-one/);
});

When(
  'preencho o formulário com nome {string}, sobrenome {string}, CEP {string}',
  async ({ page }, firstName: string, lastName: string, zipCode: string) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillForm(firstName, lastName, zipCode);
  }
);

When('continuo para o resumo do pedido', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.continue();
  // asserção de navegação omitida intencionalmente — cenários de erro verificam no Then seguinte
});

When('finalizo o pedido', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.finish();
});

Then(
  'devo ver a mensagem de confirmação {string}',
  async ({ page }, expectedMessage: string) => {
    const checkout = new CheckoutPage(page);
    const actual = await checkout.getConfirmationMessage();
    expect(actual).toBe(expectedMessage);
  }
);

Then(
  'devo ver um erro de checkout contendo {string}',
  async ({ page }, errorText: string) => {
    const checkout = new CheckoutPage(page);
    const actual = await checkout.getErrorMessage();
    expect(actual).toContain(errorText);
  }
);

When('removo {string} do carrinho', async ({ page }, productName: string) => {
  const cart = new CartPage(page);
  await cart.removeItem(productName);
});

Then('o carrinho deve estar vazio', async ({ page }) => {
  const cart = new CartPage(page);
  const items = await cart.getCartItems();
  expect(items).toHaveLength(0);
});
