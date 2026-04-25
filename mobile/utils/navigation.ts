import { APP_PACKAGE, SEL, TIMEOUT } from '../constants';

export async function ensureLoggedOut(): Promise<void> {
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
}

export async function navigateToProductsScreen(waitForItems = false): Promise<void> {
  for (let i = 0; i < 8; i++) {
    const visible = await $(SEL.PRODUCTS_SCREEN).isDisplayed().catch(() => false);
    if (visible) break;
    await browser.back();
    await browser.pause(TIMEOUT.PAUSE_MD);
  }
  await $(SEL.PRODUCTS_SCREEN).waitForDisplayed({ timeout: TIMEOUT.DEFAULT });
  if (waitForItems) {
    const itemsVisible = await $(SEL.STORE_ITEM_TEXT).isDisplayed().catch(() => false);
    if (!itemsVisible) {
      // products screen visible but items not loaded — restart app to get a fresh React Navigation state
      await driver.terminateApp(APP_PACKAGE);
      await driver.activateApp(APP_PACKAGE);
      await $(SEL.PRODUCTS_SCREEN).waitForDisplayed({ timeout: TIMEOUT.LONG });
      await $(SEL.STORE_ITEM_TEXT).waitForDisplayed({ timeout: TIMEOUT.ITEMS });
    }
  }
}
