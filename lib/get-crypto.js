/**
 * This file is required so it can be swapped by browserify with the browser equivalent at build time.
 * ./get-crypto.js is used in NodeJS and ./browser/get-crypto-window.js is used in browser.
 * Swapping is configured in packge.json
 */
module.exports = require('crypto').webcrypto; //Node equivalent of window.crypto in browser
//module.exports = window.crypto;
