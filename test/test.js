const testWallet = require("./test-wallet");

(async () => {
    console.log('---Testing wallet...');
    await testWallet();
    console.log('---Testing wallet finished.');
})();
