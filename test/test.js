const TestSend = require('./test-send');
const TestEvents = require('./test-events');
const TestWalletGen = require('./test-walletgen');
const TestGet = require('./test-get');

/**
 * These are simple tests to help develop this sdk, not quality assurance unit tests.
 * It is on my todo list to create the unit test.
 */

console.log('executing test');
TestSend.test();
TestEvents.test();
TestWalletGen.test();
TestGet.test();




