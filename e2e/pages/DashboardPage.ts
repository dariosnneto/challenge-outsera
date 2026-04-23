import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly productList: Locator;
  readonly cartIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.title');
    this.productList = page.locator('.inventory_item');
    this.cartIcon = page.locator('.shopping_cart_link');
  }

  async getTitle(): Promise<string> {
    return this.pageTitle.innerText();
  }

  async addProductToCart(productName: string): Promise<void> {
    // Locate the inventory item that contains the product name, then click its Add to Cart button
    const item = this.productList.filter({ hasText: productName });
    await item.locator('button[data-test^="add-to-cart"]').click();
  }

  async goToCart(): Promise<void> {
    await this.cartIcon.click();
  }
}
