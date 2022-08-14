const cryptoUtil = require('./../crypto-util');
const Encryption = require('./../key-encryption');

class Wallet {
    constructor(publicKey, privateKey, accountRS) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.accountRS = accountRS;
    }

    static async fromPassphrase(passPhrase) {
        let { publicKey, privateKey } = await cryptoUtil.getPublicPrivateKey(passPhrase);
        return new Wallet(publicKey, privateKey);
    }

    static async encryptedJSONFromPassPhrase(passPhrase, encryptionPassword) {
        let seed = await cryptoUtil.getSeed(passPhrase);
        return Encryption.encryptBytes(seed, encryptionPassword);
    }

    static async fromEncryptedJSON(encryptedJSON, encryptionPassword) {
        let seed = await Encryption.decryptToBytes(encryptedJSON, encryptionPassword);
        let { publicKey, privateKey } = cryptoUtil.getPublicPrivateKeyFromSeed(seed);
        return new Wallet(publicKey, privateKey);
    }

}

module.exports = Wallet;