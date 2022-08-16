import { CryptoUtil } from "../crypto-util";

import Converters = CryptoUtil.Converters;

export enum TransactionState {
    ERROR = 0,
    REQUEST_CREATED = 1,
    UNSIGNED = 2,
    SIGNED = 3,
    BROADCASTED = 4,
    CONFIRMED = 5,
    REJECTED = 6
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
export abstract class Transaction {
    private _requestJSON: Record<string, any>;
    private _unsignedTransactionBytes: string | null = null;
    private _signedTransactionBytes: string | null = null;
    private _transactionJSON: Record<string, any> | null = null;
    private _state: TransactionState;


    abstract getRequestType(): string;

    constructor(requestJSON: Record<string, any>) {
        requestJSON.requestType = this.getRequestType();
        this._requestJSON = requestJSON;
        this._state = TransactionState.REQUEST_CREATED;
    }

    canProcessRequest(): boolean {
        return this._state === TransactionState.REQUEST_CREATED;
    }

    onTransactionRequestProcessed(unsignedTransactionBytes: string, transactionJSON: Record<string, any>) {
        if (this.canProcessRequest() && Converters.isHex(unsignedTransactionBytes)) {
            this._unsignedTransactionBytes = unsignedTransactionBytes;
            this._transactionJSON = transactionJSON;
            this._state = TransactionState.UNSIGNED;
        } else {
            throw new Error('onTransactionRequestProcessed: Transaction cannot be processed');
        }
    }


    canBeSigned(): boolean {
        return this._state === TransactionState.UNSIGNED && Converters.isHex(this._unsignedTransactionBytes);
    }
    onSigned(signedTransactionBytes: string) {
        if (this.canBeSigned() && Converters.isHex(signedTransactionBytes)) {
            this._signedTransactionBytes = signedTransactionBytes;
            this._state = TransactionState.SIGNED;
        }
    }

    canBroadcast(): boolean {
        return Converters.isHex(this.signedTransactionBytes) && this.state === TransactionState.SIGNED;
    }

    onBroadcasted(result: any) {
        if (this.canBroadcast()) {
            this._state == TransactionState.BROADCASTED;
        }

    }

    get requestJSON(): Record<string, any> {
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

}