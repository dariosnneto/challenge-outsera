export const APP_PACKAGE = 'com.saucelabs.mydemoapp.rn';

export const SEL = {
  PRODUCTS_SCREEN:       '~products screen',
  STORE_ITEM_TEXT:       '~store item text',
  OPEN_MENU:             '~open menu',
  MENU_ITEM_LOG_OUT:     '~menu item log out',
  MENU_ITEM_LOG_IN:      '~menu item log in',
  LOGIN_SCREEN:          '~login screen',
  PRODUCT_SCREEN:        '~product screen',
  ADD_TO_CART_BUTTON:    '~Add To Cart button',
  CART_BADGE:            '~cart badge',
  PROCEED_TO_CHECKOUT:   '~Proceed To Checkout button',
  CHECKOUT_PAYMENT:      '~checkout payment screen',
  DIALOG_POSITIVE:       'android=new UiSelector().resourceId("android:id/button1")',
} as const;

export const TIMEOUT = {
  SHORT:    5_000,
  DEFAULT:  10_000,
  LONG:     15_000,
  ITEMS:    20_000,
  LOGOUT:   1_500,
  PAUSE_SM: 500,
  PAUSE_MD: 1_000,
  PAUSE_LG: 2_000,
} as const;
