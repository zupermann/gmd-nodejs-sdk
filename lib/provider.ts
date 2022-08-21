import { RemoteAPICaller } from "./gmd-api-caller";
import { ITransactionBroadcasted, Transaction } from "./transactions/transaction";



export interface IProvider {
    getBlockNumber(): Promise<number>;
    getBalance(account: string): Promise<string>;
}

export interface IBalanaceResponse {
    balanceNQT: string
}

export class Provider extends RemoteAPICaller implements IProvider {
    constructor(baseURL: URL) {
        super(baseURL);
    }

    //Latest block
    getBlockNumber(): Promise<number> {
        return this.apiCall('get', { requestType: 'getBlock' }).then(data => data.height);
    }

    async getBalance(rsAccount: string): Promise<string> {
        const data: IBalanaceResponse = await this.apiCall('get', { requestType: 'getBalance', account: rsAccount });
        return data.balanceNQT;
    }



    async createUnsignedTransaction(transaction: Transaction) {
        if (transaction.canProcessRequest()) {
            const unsignedTransaction = await this.apiCall('post', transaction.requestJSON);
            transaction.onTransactionRequestProcessed(unsignedTransaction.unsignedTransactionBytes);
        } else {
            throw new Error('createUnsignedTransaction cannot be processed. transaction=' + JSON.stringify(transaction));
        }
    }

    broadCastTransactionFromHex(signedTransactionHex: string): Promise<ITransactionBroadcasted> {
        return this.apiCall('post', { requestType: 'broadcastTransaction', transactionBytes: signedTransactionHex });
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

module.exports = Provider;
