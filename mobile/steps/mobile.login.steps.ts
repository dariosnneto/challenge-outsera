import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import LoginScreen from '../screens/LoginScreen';
import ProductsScreen from '../screens/ProductsScreen';
import { ensureLoggedOut, navigateToProductsScreen } from '../utils/navigation';
import { SEL } from '../constants';

Given('que estou na tela de login', async () => {
  await ensureLoggedOut();
  await LoginScreen.waitForDisplayed(SEL.LOGIN_SCREEN);
});

When('faço login com usuário {string} e senha {string}', async (username: string, password: string) => {
  await LoginScreen.login(username, password);
});

Then('devo ver a tela de produtos', async () => {
  await navigateToProductsScreen();
  const loaded = await ProductsScreen.isLoaded();
  expect(loaded).toBe(true);
});

Then('devo ver a mensagem de erro de login', async () => {
  const errorDisplayed = await LoginScreen.isErrorDisplayed();
  expect(errorDisplayed).toBe(true);
});

When('toco no primeiro produto da lista', async () => {
  await navigateToProductsScreen(true);
  await ProductsScreen.tapFirstProduct();
});

Then('devo ver os detalhes do produto', async () => {
  const displayed = await ProductsScreen.isDisplayed(SEL.PRODUCT_SCREEN);
  expect(displayed).toBe(true);
});
