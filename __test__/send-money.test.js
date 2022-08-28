import { SendMoney, Provider, Wallet } from '../dist/index.js';



export const testSendMoney = async () => {
    try {
        const provider = new Provider(new URL('https://node.thecoopnetwork.io:6877'));
        const wallet = await Wallet.fromPassphrase('screen drawn leave power connect confidence liquid everytime wall either poet shook');

        const transaction = SendMoney.createTransaction('GMD-43MP-76UW-L69N-ALW39', '10000', wallet.publicKey);
        //Optional: calculate fee. If fee is not calculated the default valur of 100,000,000 NQT (1 GMD) will be attempted.
        ////////////
        const fee = await provider.calculateFee(transaction);
        console.log('fee is: ' + fee)
        transaction.setFee(fee);
        ////////////
        await provider.createUnsignedTransaction(transaction);
        await wallet.signTransaction(transaction);
        await provider.broadcastTransaction(transaction);
    }
    catch (error) {
        console.log('Error on send money :' + error);
    }

}