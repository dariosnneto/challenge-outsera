import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly productList: Locator;
  readonly cartIcon: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.productList = page.locator('.inventory_item');
    this.cartIcon = page.locator('.shopping_cart_link');
  }

  async getTitle(): Promise<string> {
    return this.pageTitle.innerText();
  }

  async addProductToCart(productName: string): Promise<void> {
    const item = this.productList.filter({ hasText: productName });
    await item.locator('button[data-test^="add-to-cart"]').click();
  }

  async goToCart(): Promise<void> {
    await this.cartIcon.click();
  }
}
