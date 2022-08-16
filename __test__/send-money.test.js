SendMoney = require('../dist/transactions/send-money');
Provider = require('../dist/provider');
Wallet = require('../dist/wallet');


const testSendMoney = async () => {
    provider = new Provider(new URL('https://ccone.asiminei.com:6877'));
    wallet = await Wallet.fromPassphrase('screen drawn leave power connect confidence liquid everytime wall either poet shook');

    transaction = SendMoney.createTransaction('GMD-43MP-76UW-L69N-ALW39', '10000', wallet.publicKey);
    await provider.createUnsignedTransaction(transaction);
    await wallet.signTransaction(transaction);
    await provider.broadcastTransaction(transaction);

}

module.exports = testSendMoney;