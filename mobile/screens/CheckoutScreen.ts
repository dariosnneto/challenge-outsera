import { BaseScreen } from './BaseScreen';

class CheckoutScreen extends BaseScreen {
  private get fullNameField()     { return '~Full Name* input field'; }
  private get addressLine1Field() { return '~Address Line 1* input field'; }
  private get cityField()         { return '~City* input field'; }
  private get stateField()        { return '~State/Region input field'; }
  private get zipField()          { return '~Zip Code* input field'; }
  private get countryField()      { return '~Country* input field'; }
  private get paymentButton()     { return '~To Payment button'; }
  private get errorMessage()      { return '~Full Name*-error-message'; }

  async fillForm(data: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }): Promise<void> {
    await this.typeText(this.fullNameField, data.fullName);
    await this.typeText(this.addressLine1Field, data.address);
    await this.typeText(this.cityField, data.city);
    await this.typeText(this.stateField, data.state);
    await this.typeText(this.zipField, data.zip);
    await this.typeText(this.countryField, data.country);
  }

  async tapToPayment(): Promise<void> {
    await this.tap(this.paymentButton);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.errorMessage);
  }
}

export default new CheckoutScreen();
