SendMoney = require('../dist/transactions/send-money');
Provider = require('../dist/provider');
Wallet = require('../dist/wallet');


const testSendMoney = async () => {
    try {
        provider = new Provider(new URL('https://node.thecoopnetwork.io:6877'));
        wallet = await Wallet.fromPassphrase('screen drawn leave power connect confidence liquid everytime wall either poet shook');

        transaction = SendMoney.createTransaction('GMD-43MP-76UW-L69N-ALW39', '10000', wallet.publicKey);
        await provider.createUnsignedTransaction(transaction);
        await wallet.signTransaction(transaction);
        await provider.broadcastTransaction(transaction);
    }
    catch (error) {
        console.log('Error on send money :' + error);
    }

}

module.exports = testSendMoney;