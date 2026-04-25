import { BaseScreen } from './BaseScreen';
import { SEL, TIMEOUT } from '../constants';

class ProductsScreen extends BaseScreen {
  async isLoaded(): Promise<boolean> {
    return this.isDisplayed(SEL.PRODUCTS_SCREEN);
  }

  async tapFirstProduct(): Promise<void> {
    const el = await this.waitForDisplayed(SEL.STORE_ITEM_TEXT, TIMEOUT.ITEMS);
    await el.click();
  }

  async tapCart(): Promise<void> {
    await this.tap(SEL.CART_BADGE);
  }
}

export default new ProductsScreen();
