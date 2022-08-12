const GMD = require('../gmd-crypto')

TestWallet = {};

TestWallet.test = async () => {
    let jsonWallet = await GMD.generateAccount();
    console.log('---'+JSON.stringify(jsonWallet, null, 2));
    let wallet = await GMD.generateWalletFromPassphrase(jsonWallet.secretPassphrase);
    wallet.details();
}

module.exports = TestWallet;
