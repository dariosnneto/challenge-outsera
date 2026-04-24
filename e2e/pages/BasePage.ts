import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return this.errorMessage.innerText();
  }
}
