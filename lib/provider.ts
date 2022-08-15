import { RemoteAPICaller } from "./gmd-api-caller";



export interface IProvider {
    getBlockNumber(): Promise<number>;
}

export class Provider extends RemoteAPICaller implements IProvider {
    constructor(baseURL: URL) {
        super(baseURL);
    }

    //Latest block
    getBlockNumber(): Promise<number> {
        return this.apiCall('get', { requestType: 'getBlock' }).then(data => data.height);
    }

    getBalance(rsAccount: string) {
        return this.apiCall('get', { requestType: 'getBalance', account: rsAccount }).then(data => data.balanceNQT)
    }


    //returns unsigned transaction in hex format that a wallet can sign (see Wallet.signTransaction)
    async createTransaction(data: any): Promise<string> {
        let transaction = await this.apiCall('post', data);
        return transaction.unsignedTransactionBytes;
    }
}


module.exports = Provider;

// export enum TransactionType {
//     PAYMENT = 0,
//     MESSAGING = 1,
//     COLORED_COINS = 2,
//     DIGITAL_GOODS = 3,
//     ACCOUNT_CONTROL = 4,
//     MONETARY_SYSTEM = 5,
//     DATA = 6,
//     SHUFFLING = 7
// }

// const TransactionSubtype = [
//     ["ORDINARY_PAYMENT"],
//     ["ARBITRARY_MESSAGE", "ALIAS_ASSIGNMENT", "POLL_CREATION", "VOTE_CASTING", "HUB_ANNOUNCEMENT", "ACCOUNT_INFO", "ALIAS_SELL", "ALIAS_BUY", "ALIAS_DELETE", "PHASING_VOTE_CASTING", "ACCOUNT_PROPERTY", "ACCOUNT_PROPERTY_DELETE"],
//     ["ASSET_ISSUANCE", "ASSET_TRANSFER", "ASK_ORDER_PLACEMENT", "BID_ORDER_PLACEMENT", "ASK_ORDER_CANCELLATION", "BID_ORDER_CANCELLATION", "DIVIDEND_PAYMENT", "ASSET_DELETE", "ASSET_INCREASE", "PROPERTY_SET", "PROPERTY_DELETE"],
//     ["LISTING", "DELISTING", "PRICE_CHANGE", "QUANTITY_CHANGE", "PURCHASE", "DELIVERY", "FEEDBACK", "REFUND"],
//     ["EFFECTIVE_BALANCE_LEASING", "PHASING_ONLY"],
//     ["CURRENCY_ISSUANCE", "RESERVE_INCREASE", "RESERVE_CLAIM", "CURRENCY_TRANSFER", "PUBLISH_EXCHANGE_OFFER", "EXCHANGE_BUY", "EXCHANGE_SELL", "CURRENCY_MINTING", "CURRENCY_DELETION"],
//     ["UPLOAD", "EXTEND"],
//     ["CREATION", "REGISTRATION", "PROCESSING", "RECIPIENTS", "VERIFICATION", "CANCELLATION"]
// ]