import { BaseScreen } from './BaseScreen';
import { TIMEOUT } from '../constants';

class LoginScreen extends BaseScreen {
  private get usernameField() { return '~Username input field'; }
  private get passwordField() { return '~Password input field'; }
  private get loginButton()   { return '~Login button'; }
  private get errorMessage()  { return '~generic-error-message'; }

  async login(username: string, password: string): Promise<void> {
    await this.typeText(this.usernameField, username);
    await this.typeText(this.passwordField, password);
    await this.tap(this.loginButton);
    await browser.pause(TIMEOUT.PAUSE_LG);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.errorMessage);
  }
}

export default new LoginScreen();
