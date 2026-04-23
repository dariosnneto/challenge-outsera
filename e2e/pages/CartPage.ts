import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async getCartItems(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_name').allInnerTexts();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async removeItem(productName: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName });
    await item.locator('button[data-test^="remove"]').click();
  }
}
