const testWallet = require('./wallet.test');
const testProvider = require('./provider.test');
const testSendMoney = require('./send-money.test');

(async () => {
    console.log('---Testing wallet...');
    await testWallet();
    console.log('---Testing wallet finished.');

    console.log('---Testing provider...');
    await testProvider();
    console.log('---Testing provider finished.');


    console.log('---Testing send money...');
    await testSendMoney();
    console.log('---Testing send money finished.');
})();
