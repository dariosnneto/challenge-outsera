export abstract class BaseScreen {
  async waitForDisplayed(selector: string, timeout = 15000) {
    const element = $(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  async tap(selector: string): Promise<void> {
    const element = await this.waitForDisplayed(selector);
    await element.click();
  }

  async typeText(selector: string, text: string): Promise<void> {
    const element = await this.waitForDisplayed(selector);
    await element.clearValue();
    await element.setValue(text);
  }

  async getText(selector: string): Promise<string> {
    const element = await this.waitForDisplayed(selector);
    return element.getText();
  }

  async isDisplayed(selector: string): Promise<boolean> {
    try {
      const element = $(selector);
      return element.isDisplayed();
    } catch {
      return false;
    }
  }
}
