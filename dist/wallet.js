"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_util_1 = __importDefault(require("./crypto-util"));
const key_encryption_1 = __importDefault(require("./key-encryption"));
class Wallet {
    constructor(publicKey, privKey, accountRS = '') {
        this.publicKey = publicKey;
        this.privKey = privKey;
        this.accountRS = accountRS;
    }
    static async fromPassphrase(passPhrase) {
        let { publicKey, privateKey } = await crypto_util_1.default.getPublicPrivateKey(passPhrase);
        return new Wallet(publicKey, privateKey);
    }
    static async encryptedJSONFromPassPhrase(passPhrase, encryptionPassword) {
        let seed = await crypto_util_1.default.getSeed(passPhrase);
        return key_encryption_1.default.encryptBytes(seed, encryptionPassword);
    }
    static async fromEncryptedJSON(encryptedJSON, encryptionPassword) {
        let seed = await key_encryption_1.default.decryptToBytes(encryptedJSON, encryptionPassword);
        let { publicKey, privateKey } = crypto_util_1.default.getPublicPrivateKeyFromSeed(seed);
        return new Wallet(publicKey, privateKey);
    }
    details() {
        console.log('details ' + JSON.stringify(this, null, 2));
    }
}
module.exports = Wallet;
