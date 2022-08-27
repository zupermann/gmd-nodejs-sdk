import { CryptoUtil } from './crypto-util.js';
import { KeyEncryption, IEncryptedJSON } from './key-encryption.js';
import PassPhraseGenerator from './pass-gen.js'
import { Provider } from './provider.js';
import { Signer } from './signer.js';
import { SendMoney } from './transactions/send-money.js';



export class Wallet extends Signer {
    accountId: string;
    accountRS: string;
    provider: Provider | null;
    constructor(publicKey: string, privKey: string, accountId: string, provider: Provider | null = null) {
        super(publicKey, privKey);
        this.accountId = accountId;
        this.accountRS = CryptoUtil.Crypto.accountIdToRS(accountId);
        this.provider = provider;
    }

    connect(provider: Provider) {
        this.provider = provider;
    }

    async getBalance(): Promise<string> {
        if (this.provider == null) {
            throw new Error('Cannot get balance if no provider connected'); //TODO refine errors
        } else {
            return this.provider.getBalance(this.accountRS);
        }
    }

    async sendGMD(to: string, amount: string) {
        const transaction = await this.createUnsignedSendGMDTransaction(to, amount);
        await this.signTransaction(transaction);
        await this.provider?.broadcastTransaction(transaction);
        return transaction;
    }

    async createUnsignedSendGMDTransaction(to: string, amount: string) {
        if (this.provider == null) {
            throw new Error('Cannot send GMD if no provider is connected');
        }
        const transaction = SendMoney.createTransaction(to, amount, this.publicKey);
        await this.provider.createUnsignedTransaction(transaction);
        return transaction;
    }

    //static wallet creation functions
    static async fromPassphrase(passPhrase: string) {
        const { publicKey, privateKey, accountId } = await CryptoUtil.Crypto.getWalletDetails(passPhrase);
        return new Wallet(publicKey, privateKey, accountId);
    }

    static async encryptedJSONFromPassPhrase(passPhrase: string, encryptionPassword: string) {
        const seed = await CryptoUtil.Crypto.getSeed(passPhrase);
        return KeyEncryption.encryptBytes(seed, encryptionPassword);
    }

    static async fromEncryptedJSON(encryptedJSON: IEncryptedJSON, encryptionPassword: string): Promise<Wallet> {
        const seed = await KeyEncryption.decryptToBytes(encryptedJSON, encryptionPassword);
        const { publicKey, privateKey, accountId } = await CryptoUtil.Crypto.getWalletDetailsFromSeed(seed);
        return new Wallet(publicKey, privateKey, accountId);
    }

    static async accountIdFromPublicKey(publicKeyHex: string): Promise<string> {
        return CryptoUtil.Crypto.publicKeyToAccountId(publicKeyHex);
    }

    static generatePassphrase(numberOfWords?: number): string {
        return PassPhraseGenerator.generatePass(numberOfWords);
    }
}