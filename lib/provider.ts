
import { RemoteAPICallerHelper } from "./remote-api-caller-helper.js";
import { ITransactionBroadcasted, Transaction } from "./transactions/transaction.js";



export interface IProvider {
    getBlockNumber(): Promise<number>;
    getBalance(account: string): Promise<string>;
}

export interface IBalanaceResponse {
    balanceNQT: string
}

export class Provider extends RemoteAPICallerHelper implements IProvider {
    constructor(baseURL: URL) {
        super(baseURL);
    }

    async createUnsignedTransaction(transaction: Transaction) {
        if (transaction.canProcessRequest()) {
            const unsignedTransaction = await this.apiCall('post', transaction.requestJSON);
            transaction.onTransactionRequestProcessed(unsignedTransaction.unsignedTransactionBytes as string);
        } else {
            throw new Error('createUnsignedTransaction cannot be processed. transaction=' + JSON.stringify(transaction));
        }
    }

    async broadCastTransactionFromHex(signedTransactionHex: string): Promise<ITransactionBroadcasted> {
        const data = await this.apiCall('post', { requestType: 'broadcastTransaction', transactionBytes: signedTransactionHex });
        const ret = (data as unknown) as ITransactionBroadcasted;
        return ret;
    }

    async broadcastTransaction(transaction: Transaction) {
        if (transaction.canBroadcast() && transaction.signedTransactionBytes) {
            const result: ITransactionBroadcasted = await this.broadCastTransactionFromHex(transaction.signedTransactionBytes)
            transaction.onBroadcasted(result);
            return result;
        } else {
            throw new Error('broadCastTransaction cannot be processed. transaction=' + JSON.stringify(transaction));
        }
    }
}

