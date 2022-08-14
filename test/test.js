const TestSend = require('./test-send');
const TestEvents = require('./test-events');
const TestWalletGen = require('./test-walletgen');
const TestGet = require('./test-get');
const TestSignature = require('./test-signature');
const TestEncryption = require('./test-encryption');
const TestWallet = require('./test-wallet');

/**
 * These are simple tests to help develop this sdk, not quality assurance unit tests.
 * It is on my todo list to create the unit test.
 */
(async () => {
    console.log('executing test');

    console.log('=====TestSend=====');
    await TestSend.test();

    console.log('=====TestWalletGen=====');
    await TestWalletGen.test();

    console.log('=====TestGet=====');
    await TestGet.test();
    //TestEvents.test();

    console.log('=====TestSignature=====');
    await TestSignature.test();

    console.log('=====TestEncryption=====');
    await TestEncryption.test();

    console.log('=====TestWallet=====');
    await TestWallet.test();
})();


