import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import LoginScreen from '../screens/LoginScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import { navigateToProductsScreen } from '../utils/navigation';
import { SEL, TIMEOUT } from '../constants';

Given('que estou autenticado com usuário {string} e senha {string}', async (username: string, password: string) => {
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
  await LoginScreen.login(username, password);
  await navigateToProductsScreen();
});

Given('adicionei um produto ao carrinho', async () => {
  await ProductsScreen.tapFirstProduct();
  await $(SEL.ADD_TO_CART_BUTTON).waitForDisplayed({ timeout: TIMEOUT.DEFAULT });
  await $(SEL.ADD_TO_CART_BUTTON).click();
  await ProductsScreen.tapCart();
});

Given('naveguei até o checkout', async () => {
  await $(SEL.PROCEED_TO_CHECKOUT).click();
});

When('preencho o formulário com os dados:', async (dataTable: { rows: () => string[][] }) => {
  const rows = dataTable.rows();
  const data: Record<string, string> = {};
  for (const [campo, valor] of rows) {
    data[campo] = valor;
  }
  await CheckoutScreen.fillForm({
    fullName: data['fullName'],
    address:  data['address'],
    city:     data['city'],
    state:    data['state'],
    zip:      data['zip'],
    country:  data['country'],
  });
});

When('toco em {string}', async (button: string) => {
  await $(`~${button}`).click();
});

When('toco em {string} sem preencher o formulário', async (_button: string) => {
  await CheckoutScreen.tapToPayment();
});

Then('devo avançar para a tela de pagamento', async () => {
  const paymentScreen = await $(SEL.CHECKOUT_PAYMENT);
  await paymentScreen.waitForDisplayed({ timeout: TIMEOUT.DEFAULT });
  expect(await paymentScreen.isDisplayed()).toBe(true);
});

Then('devo ver o erro de campo obrigatório no formulário', async () => {
  const errorDisplayed = await CheckoutScreen.isErrorDisplayed();
  expect(errorDisplayed).toBe(true);
});
