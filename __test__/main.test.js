const testWallet = require('./wallet.test');
const testProvider = require('./provider.test');

(async () => {
    console.log('---Testing wallet...');
    await testWallet();
    console.log('---Testing wallet finished.');

    console.log('---Testing provider...');
    await testProvider();
    console.log('---Testing provider finished.');
})();
