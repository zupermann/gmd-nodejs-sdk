const GMD = require('../gmd-crypto');
const Wallet = require('../lib/wallet');

TestWallet = {};

TestWallet.test = async () => {
    let jsonReferenceWallet = await GMD.generateAccount();
    console.log('==TestWallet== Reference wallet: ' + JSON.stringify(jsonReferenceWallet, null, 2));
    console.assert(jsonReferenceWallet, "Reference wallet gen failed");

    await TestWallet.test1(jsonReferenceWallet);
    await TestWallet.test2(jsonReferenceWallet);

}

TestWallet.test1 = async (jsonReferenceWallet) => {
    let wallet = await GMD.generateWalletFromPassphrase(jsonReferenceWallet.secretPassphrase);
    console.assert(jsonReferenceWallet.publicKey == wallet.publicKey, 'Test1 Wallet generation failed. Public key not as expected');
    console.assert(jsonReferenceWallet.privateKey == wallet.privateKey, 'Test1 Wallet generation failed. Private key not as expected');
}

TestWallet.test2 = async (jsonReferenceWallet) => {
    let wallet = await Wallet.fromPassphrase(jsonReferenceWallet.secretPassphrase);
    console.assert(jsonReferenceWallet.publicKey == wallet.publicKey, 'Test2 Wallet generation failed. Public key not as expected');
    console.assert(jsonReferenceWallet.privateKey == wallet.privateKey, 'Test2 Wallet generation failed. Private key not as expected');
}

TestWallet.test3 = async (jsonReferenceWallet) => {
    let encryptedJSON = await Wallet.encryptedJSONFromPassPhrase(jsonReferenceWallet.secretPassphrase);
    let wallet = Wallet.fromEncryptedJSON(encryptedJSON);
    console.assert(jsonReferenceWallet.publicKey == wallet.publicKey, 'Test3 Wallet generation failed. Public key not as expected');
    console.assert(jsonReferenceWallet.privateKey == wallet.privateKey, 'Test3 Wallet generation failed. Private key not as expected');
}

module.exports = TestWallet;
