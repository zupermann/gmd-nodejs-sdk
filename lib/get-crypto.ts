/**
 * This file is required so it can be swapped by browserify with the browser equivalent at build time.
 * ./get-crypto.js is used in NodeJS and ./browser/get-crypto-window.js is used in browser.
 * Swapping is configured in packge.json
 */
/* eslint @typescript-eslint/no-var-requires: "off" */
export default require('crypto').webcrypto //Node equivalent of window.crypto in browser
