/**
 * This file is required so it can be swapped by browserify with the browser equivalent at build time.
 * ./get-axios.js is used in NodeJS and ./browser/get-axios-browser.js is used in browser.
 * Swapping is configured in packge.json
 */
module.exports = require('axios');