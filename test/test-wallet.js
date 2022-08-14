const Wallet = require('../dist/wallet.js')
const secretPassphrase = "this is a paasphrase example";
const pubKey = "9c7bba1b3e2647290a92342d622c0c0514521a35a1670a20612c64666f035938";
const privKey = "39c8834113346ed3ba6ac90eff170a302a9264680f9d5a578931dd2c22d65e05";

const testWallet = async () => {
    console.log('Testing wallet from passphrase');
    await test1();
    console.log('Wallet from passphrase test OK');

    console.log('Testing wallet encryption');
    await test2();
    console.log('Wallet encryption test OK');

    console.log('Testing new wallet generation');
    await test3();
    console.log('New wallet generation test OK');
};

const test1 = async () => {
    let wallet = await Wallet.fromPassphrase(secretPassphrase);
    console.assert(wallet.publicKey == pubKey, "Wallet.fromPassphrase failed publicKey");
    console.assert(wallet.privateKey == privKey, "Wallet.fromPassphrase failed privateKey");
}

const test2 = async () => {
    let encryptedJSON = await Wallet.encryptedJSONFromPassPhrase(secretPassphrase, "password example 123@@!");
    let wallet = await Wallet.fromEncryptedJSON(encryptedJSON, "password example 123@@!");
    console.assert(wallet.publicKey == pubKey, "Wallet.fromEncryptedJSON failed publicKey");
    console.assert(wallet.privateKey == privKey, "Wallet.fromEncryptedJSON failed privateKey");
}

const test3 = async () => {
    let wallet = await Wallet.newWallet();
    console.log('New wallet generated: ' + JSON.stringify(wallet, null, 2));
    console.assert(typeof wallet.publicKey === 'string' && wallet.publicKey.length > 0, "New wallet failed. No private key generated.");
    console.assert(typeof wallet.privateKey === 'string' && wallet.privateKey.length > 0, "New wallet failed. No public key generated.");
}


module.exports = testWallet;