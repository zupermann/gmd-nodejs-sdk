import { CryptoUtil } from "../crypto-util.js";
import { RemoteAPICaller } from "../gmd-api-caller.js";
import { Signer } from "../signer.js";

import Converters = CryptoUtil.Converters;

export enum TransactionState {
    ERROR = 'error',
    REQUEST_CREATED = 'request_created',
    UNSIGNED = 'unsigned',
    SIGNED = 'signed',
    BROADCASTED = 'broadcasted',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected'
}

/**
 * Any transaction has 5 steps:
 * 1. Create request JSON
 * 2. Process request JSON to an unsigned transaction (remote API call to a node is necessary)
 * 3. Sign the unsigned transaction
 * 4. Broadcast the signed transaction (remote API call to a node is necessary)
 * 5. [Optional] Transaction is confirmed after the trasaction is written to the blockchain and at leat
 *    one block is written on top of the transaction block (remote API call to a node is necessary).
 * 
 * The state of the transaction can only go through each step in the specified order.
 */
export class Transaction {
    private _requestJSON: IRequestJSON | null = null;
    private _unsignedTransactionBytes: string | null = null;
    private _signedTransactionBytes: string | null = null;
    private _state: TransactionState;
    private _transactionID: string | null = null;
    private _fullHash: string | null = null;
    private _transactionJSON: ITransactionJSON | null = null;


    //========== Step 1 (local)=============
    protected constructor(requestJSON?: IRequestJSON) {
        if (requestJSON) {
            this._requestJSON = requestJSON;
            this._state = TransactionState.REQUEST_CREATED;
        } else {
            this._state = TransactionState.ERROR;
        }
    }

    async calculateFee(remote: RemoteAPICaller) {
        const data = await remote.apiCall('post', { ...this.requestJSON, feeNQT: '0' } as unknown as Record<string, string>);
        const transactionData = data as unknown as ITransaction;
        return CryptoUtil.Crypto.NqtToGmd(transactionData.transactionJSON.feeNQT);
    }

    setFee(feeGMD: string) {
        if (this.state === TransactionState.REQUEST_CREATED) {
            (this.requestJSON as IRequestJSON).feeNQT = CryptoUtil.Crypto.GmdToNqt(feeGMD);
        } else {
            throw new Error('Cannot set fee after the unsigned transaction was already created');//TODO refine errors
        }
    }
    //======================================


    //========== Step 2 (remote)=============
    async createUnsignedTransaction(remote: RemoteAPICaller) {
        if (this.canCreateUnsignedTransaction()) {
            const unsignedTransaction = await remote.apiCall('post', this.requestJSON as unknown as Record<string, string>);
            this.onCreatedUnsignedTransaction((unsignedTransaction as unknown as IUnsignedTransaction).unsignedTransactionBytes);
        } else {
            throw new Error('createUnsignedTransaction cannot be processed. transaction=' + JSON.stringify(this));
        }
    }

    canCreateUnsignedTransaction(): boolean {
        if (this._requestJSON && 'secretPhrase' in this._requestJSON) {
            throw new Error('Do not send secret password to node!');
        }
        return this.state === TransactionState.REQUEST_CREATED;
    }

    private onCreatedUnsignedTransaction(unsignedTransactionBytes: string) {
        if (this.canCreateUnsignedTransaction() && Converters.isHex(unsignedTransactionBytes)) {
            this._unsignedTransactionBytes = unsignedTransactionBytes;
            this._state = TransactionState.UNSIGNED;
        } else {
            throw new Error('onTransactionRequestProcessed: Transaction cannot be processed');
        }
    }
    //======================================


    //========== Step 3 (local)=============
    async signTransaction(signer: Signer) {
        if (this.state === TransactionState.UNSIGNED && this.unsignedTransactionBytes && Converters.isHex(this.unsignedTransactionBytes)) {
            const signedTransactionBytes = await signer.signTransactionBytes(this.unsignedTransactionBytes);
            this.onSigned(signedTransactionBytes);
            return this;
        } else {
            throw new Error('Cannot sign transaction ' + JSON.stringify(this));
        }
    }
    canBeSigned(): boolean {
        return this._state === TransactionState.UNSIGNED && Converters.isHex(this._unsignedTransactionBytes);
    }
    private onSigned(signedTransactionBytes: string) {
        if (this.canBeSigned() && Converters.isHex(signedTransactionBytes)) {
            this._signedTransactionBytes = signedTransactionBytes;
            this._state = TransactionState.SIGNED;
        }
    }
    //=======================================


    //========== Step 4 (remote)=============
    async broadcastTransaction(remote: RemoteAPICaller) {
        if (this.canBroadcast() && this.signedTransactionBytes) {
            const result: ITransactionBroadcasted = await this.broadCastTransactionFromHex(this.signedTransactionBytes, remote)
            this.onBroadcasted(result);
            return result;
        } else {
            throw new Error('broadCastTransaction cannot be processed. transaction=' + JSON.stringify(this));
        }
    }

    async broadCastTransactionFromHex(signedTransactionHex: string, remote: RemoteAPICaller): Promise<ITransactionBroadcasted> {
        const data = await remote.apiCall('post', { requestType: 'broadcastTransaction', transactionBytes: signedTransactionHex });
        return data as unknown as ITransactionBroadcasted;
    }

    canBroadcast(): boolean {
        return Converters.isHex(this.signedTransactionBytes) && this.state === TransactionState.SIGNED;
    }

    private onBroadcasted(result: ITransactionBroadcasted) {
        if (this.canBroadcast()) {
            this._transactionID = result.transaction;
            this._fullHash = result.fullHash;
            this._state = TransactionState.BROADCASTED;
        } else {
            throw new Error('Something went wrong on transaction broadcast');
        }

    }
    //=======================================

    ////// getters
    get requestJSON(): IRequestJSON | null {
        return this._requestJSON;
    }

    get state(): TransactionState {
        return this._state;
    }

    get unsignedTransactionBytes(): string | null {
        return this._unsignedTransactionBytes;
    }

    get signedTransactionBytes(): string | null {
        return this._signedTransactionBytes;
    }

    //static functions
    static createTransactionFromRequestJSON(requestJSON: IRequestJSON) {
        return new Transaction(requestJSON);
    }

    static createTransactionFromBytes(bytes: string, signed: boolean) {
        const transaction = new Transaction();
        if (signed) {
            transaction._signedTransactionBytes = bytes;
            transaction._state = TransactionState.SIGNED;
        } else {
            transaction._unsignedTransactionBytes = bytes;
            transaction._state = TransactionState.UNSIGNED;
        }
    }

    public static async getTransactionJSONFromBytes(bytes: string, remote: RemoteAPICaller) {
        const data = await remote.apiCall('get', { requestType: 'parseTransaction', transactionBytes: bytes });
        return data as unknown as ITransactionJSON;
    }
}


export interface IRequestJSON {
    requestType: string,
    recipient: string,
    publicKey: string,
    feeNQT: string,
    deadline: number,
    message?: string
}

export interface ITransactionBroadcasted {
    fullHash: string,
    transaction: string
}

export interface ITransaction {
    transactionJSON: ITransactionJSON,
}

export interface ITransactionJSON {
    senderPublicKey: string,
    feeNQT: string,
    type: TransactionType,
    subtype: number,
    version: 1,
    phased: boolean,
    ecBlockId: string,
    attachment: unknown,
    senderRS: string,
    amountNQT: string,
    sender: string,
    recipientRS: string,
    recipient: string,
    ecBlockHeight: number,
    deadline: number,
    timestamp: number,
    height: number,
    signature?: string;
    fullHash?: string
}

export interface IUnsignedTransaction {
    unsignedTransactionBytes: string
}

export enum TransactionType {
    PAYMENT = 0,
    MESSAGING = 1,
    COLORED_COINS = 2,
    DIGITAL_GOODS = 3,
    ACCOUNT_CONTROL = 4,
    MONETARY_SYSTEM = 5,
    DATA = 6,
    SHUFFLING = 7
}