import path from 'path';
import os from 'os';
import { APP_PACKAGE, TIMEOUT } from '../constants';

const ANDROID_HOME = process.env.ANDROID_HOME
  || path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk');

process.env.ANDROID_HOME = ANDROID_HOME;
process.env.ANDROID_SDK_ROOT = ANDROID_HOME;

const APK_PATH = path.resolve(__dirname, '../apps/MyDemoAppRN.apk');
const ROOT = path.resolve(__dirname, '../..');

export const config = {
  runner: 'local' as const,
  port: 4723,

  specs: [
    [
      path.join(ROOT, 'mobile', 'features', 'mobile.login.feature'),
      path.join(ROOT, 'mobile', 'features', 'mobile.checkout.feature'),
    ],
  ],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      'appium:deviceName': 'emulator-5554',
      'appium:platformVersion': '14.0',
      'appium:automationName': 'UiAutomator2',
      'appium:app': APK_PATH,
      'appium:appPackage': APP_PACKAGE,
      'appium:appActivity': `${APP_PACKAGE}.MainActivity`,
      'appium:noReset': false,
      'appium:forceAppLaunch': true,
      'appium:newCommandTimeout': 240,
      'appium:autoGrantPermissions': true,
    },
  ],

  logLevel: 'error' as const,

  async beforeScenario() {
    await driver.terminateApp(APP_PACKAGE);
    await driver.activateApp(APP_PACKAGE);
    await browser.pause(TIMEOUT.PAUSE_LG);
  },

  bail: 0,
  retries: process.env.CI ? 1 : 0,
  waitforTimeout: TIMEOUT.LONG,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 3,

  services: ['appium' as const],
  framework: 'cucumber' as const,

  reporters: [
    'spec' as const,
    [
      'allure',
      {
        outputDir: 'mobile/reports/allure-results',
        disableWebdriverStepsReporting: true,
        useCucumberStepReporter: true,
        addConsoleLogs: true,
      },
    ],
  ],

  cucumberOpts: {
    require: [path.join(ROOT, 'mobile/steps/**/*.ts')],
    backtrace: false,
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '',
    timeout: 60_000,
    ignoreUndefinedDefinitions: false,
  },
};
