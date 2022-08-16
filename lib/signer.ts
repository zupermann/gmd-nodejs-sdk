import { CryptoUtil } from './crypto-util';

export class Signer {
    publicKey: string;
    protected privateKey: string;
    constructor(publicKey: string, privKey: string) {
        this.publicKey = publicKey;
        this.privateKey = privKey;
    }

    async signTransaction(unsignedTransactionHex: string): Promise<string> {
        const sig = await CryptoUtil.Crypto.signBytesPrivateKey(unsignedTransactionHex, this.privateKey);
        return unsignedTransactionHex.slice(0, 192) + sig + unsignedTransactionHex.slice(320);
    }
}