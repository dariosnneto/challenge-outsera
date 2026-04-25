import { APP_PACKAGE, SEL, TIMEOUT } from '../constants';

export async function navigateToProductsScreen(waitForItems = false): Promise<void> {
  for (let i = 0; i < 8; i++) {
    const visible = await $(SEL.PRODUCTS_SCREEN).isDisplayed().catch(() => false);
    if (visible) break;
    await browser.back();
    await browser.pause(800);
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
