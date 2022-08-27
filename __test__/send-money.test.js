import { SendMoney, Provider, Wallet } from '../dist/index.js';



export const testSendMoney = async () => {
    try {
        const provider = new Provider(new URL('https://node.thecoopnetwork.io:6877'));
        const wallet = await Wallet.fromPassphrase('screen drawn leave power connect confidence liquid everytime wall either poet shook');

        const transaction = SendMoney.createTransaction('GMD-43MP-76UW-L69N-ALW39', '10000', wallet.publicKey);
        await provider.createUnsignedTransaction(transaction);
        await wallet.signTransaction(transaction);
        await provider.broadcastTransaction(transaction);
    }
    catch (error) {
        console.log('Error on send money :' + error);
    }

}