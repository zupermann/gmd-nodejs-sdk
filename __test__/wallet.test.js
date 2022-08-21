const Wallet = require('../dist/wallet.js')
const secretPassphrase = "this is a paasphrase example";
const pubKey = "9c7bba1b3e2647290a92342d622c0c0514521a35a1670a20612c64666f035938";
const privKey = "39c8834113346ed3ba6ac90eff170a302a9264680f9d5a578931dd2c22d65e05";
const accountId = '5224136646640665215';
const accountRS = 'GMD-W2MZ-M9WK-G2LJ-6WYZJ';

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
    console.assert(wallet.accountId == accountId, "Wallet.fromPassphrase failed accountId");
    console.assert(wallet.accountRS == accountRS, "Wallet.fromPassphrase failed accountRS");
}

const test2 = async () => {
    let encryptedJSON = await Wallet.encryptedJSONFromPassPhrase(secretPassphrase, "password example 123@@!");
    let wallet = await Wallet.fromEncryptedJSON(encryptedJSON, "password example 123@@!");
    console.assert(wallet.publicKey == pubKey, "Wallet.fromEncryptedJSON failed publicKey");
    console.assert(wallet.privateKey == privKey, "Wallet.fromEncryptedJSON failed privateKey");
    console.assert(wallet.accountId == accountId, "Wallet.fromEncryptedJSON failed accountId");
    console.assert(wallet.accountRS == accountRS, "Wallet.fromEncryptedJSON failed accountRS");
}

const test3 = async () => {
    let passPhrase = Wallet.generatePassphrase();
    console.log('new passphrase generated:' + passPhrase);
    let wallet = await Wallet.fromPassphrase(passPhrase);
    console.log('New wallet generated: ' + JSON.stringify(wallet, null, 2));
    console.assert(typeof wallet.publicKey === 'string' && wallet.publicKey.length > 0, "New wallet failed. No public key generated.");
    console.assert(typeof wallet.privateKey === 'string' && wallet.privateKey.length > 0, "New wallet failed. No private key generated.");
    console.assert(typeof wallet.accountId === 'string' && wallet.accountId.length > 0, "New wallet failed. No accountId key generated.");
    console.assert(typeof wallet.accountRS === 'string' && wallet.accountRS.length > 0, "New wallet failed. No accountRS key generated.");
}


module.exports = testWallet;