import cryptoUtil from './crypto-util';
import Encryption from './key-encryption';

class Wallet {
    publicKey: string;
    privateKey: string;
    accountId: string;
    accountRS: string;
    constructor(publicKey: string, privKey: string, accountId: string) {
        this.publicKey = publicKey;
        this.privateKey = privKey;
        this.accountId = accountId;
        this.accountRS = cryptoUtil.accountIdToRS(accountId);
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
        let { publicKey, privateKey, accountId } = await cryptoUtil.getWalletDetails(passPhrase);
        return new Wallet(publicKey, privateKey, accountId);
    }

    static async encryptedJSONFromPassPhrase(passPhrase: string, encryptionPassword: string) {
        let seed = await cryptoUtil.getSeed(passPhrase);
        return Encryption.encryptBytes(seed, encryptionPassword);
    }

    static async fromEncryptedJSON(encryptedJSON: string, encryptionPassword: string): Promise<Wallet> {
        let seed = await Encryption.decryptToBytes(encryptedJSON, encryptionPassword);
        let { publicKey, privateKey, accountId } = await cryptoUtil.getWalletDetailsFromSeed(seed);
        return new Wallet(publicKey, privateKey, accountId);
    }

    static async accountIdFromPublicKey(publicKeyHex: string): Promise<string> {
        return cryptoUtil.publicKeyToAccountId(publicKeyHex);
    }

}

module.exports = Wallet;