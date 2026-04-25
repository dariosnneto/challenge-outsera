import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import LoginScreen from '../screens/LoginScreen';
import ProductsScreen from '../screens/ProductsScreen';
import { navigateToProductsScreen } from '../utils/navigation';
import { SEL, TIMEOUT } from '../constants';

Given('que estou na tela de login', async () => {
  await navigateToProductsScreen();
  await $(SEL.OPEN_MENU).click();
  await browser.pause(TIMEOUT.PAUSE_SM);
  const logoutItem = await $(SEL.MENU_ITEM_LOG_OUT);
  const isLoggedIn = await logoutItem.isDisplayed();
  if (isLoggedIn) {
    await logoutItem.click();
    await browser.pause(TIMEOUT.LOGOUT);
    await $(SEL.DIALOG_POSITIVE).waitForDisplayed({ timeout: TIMEOUT.SHORT });
    await $(SEL.DIALOG_POSITIVE).click();
    await browser.pause(TIMEOUT.PAUSE_MD);
    await $(SEL.DIALOG_POSITIVE).waitForDisplayed({ timeout: TIMEOUT.SHORT });
    await $(SEL.DIALOG_POSITIVE).click();
    await browser.pause(TIMEOUT.PAUSE_MD);
  } else {
    await $(SEL.MENU_ITEM_LOG_IN).click();
    await browser.pause(TIMEOUT.PAUSE_MD);
  }
  await LoginScreen.waitForDisplayed(SEL.LOGIN_SCREEN);
});

When('faço login com usuário {string} e senha {string}', async (username: string, password: string) => {
  await LoginScreen.login(username, password);
});

Then('devo ver a tela de produtos', async () => {
  for (let i = 0; i < 8; i++) {
    const visible = await $(SEL.PRODUCTS_SCREEN).isDisplayed().catch(() => false);
    if (visible) break;
    await browser.back();
    await browser.pause(TIMEOUT.PAUSE_MD);
  }
  await $(SEL.PRODUCTS_SCREEN).waitForDisplayed({ timeout: TIMEOUT.DEFAULT });
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
