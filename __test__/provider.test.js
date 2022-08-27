import { Provider } from '../dist/index.js';
let provider = new Provider(new URL('https://node.thecoopnetwork.io:6877'));

export const testProvider = async () => {

    console.log(JSON.stringify(provider, null, 2));
    await test1();

    await test2();

    await test3();


}

const test1 = async () => {
    const paramsGetTransactions = {
        requestType: 'getTransactionsBulk',
        pageSize: 3,
        page: 0
    }

    //provider.setLogger(console.log);
    let data = await provider.apiCall('get', paramsGetTransactions);
    console.log('==========' + JSON.stringify(data, null, 2));
}

const test2 = async () => {
    let blockNo = await provider.getBlockNumber();
    console.log('blockNo=' + blockNo);
}


const test3 = async () => {
    const data = await provider.getTransactions(true, 'GMD-N2L2-GZXR-NES8-CJMBC', 2);
    console.log('getOutTransactions(GMD-N2L2-GZXR-NES8-CJMBC): ' + JSON.stringify(data, null, 2));
}