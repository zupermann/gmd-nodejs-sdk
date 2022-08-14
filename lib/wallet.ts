import cryptoUtil from './crypto-util';
import Encryption from './key-encryption';

class Wallet {
    publicKey: string;
    privateKey: string;
    accountRS: string;
    constructor(publicKey: string, privKey: string, accountRS = '') {
        this.publicKey = publicKey;
        this.privateKey = privKey;
        this.accountRS = accountRS;
    }

    static async newWallet(numberOfWords?: number) {
        if (!numberOfWords) {
            numberOfWords = 12;
        }
        const PassPhraseGenerator = require('./pass-gen');
        const passPhrase = PassPhraseGenerator.generatePass(numberOfWords);
        return this.fromPassphrase(passPhrase);
    }

    static async fromPassphrase(passPhrase: string) {
        let { publicKey, privateKey } = await cryptoUtil.getPublicPrivateKey(passPhrase);
        return new Wallet(publicKey, privateKey);
    }

    static async encryptedJSONFromPassPhrase(passPhrase: string, encryptionPassword: string) {
        let seed = await cryptoUtil.getSeed(passPhrase);
        return Encryption.encryptBytes(seed, encryptionPassword);
    }

    static async fromEncryptedJSON(encryptedJSON: string, encryptionPassword: string): Promise<Wallet> {
        let seed = await Encryption.decryptToBytes(encryptedJSON, encryptionPassword);
        let { publicKey, privateKey } = cryptoUtil.getPublicPrivateKeyFromSeed(seed);
        return new Wallet(publicKey, privateKey);
    }

}

module.exports = Wallet;