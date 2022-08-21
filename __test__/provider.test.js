const Provider = require('../dist/provider');

const testProvider = async () => {
    let provider = new Provider(new URL('https://node.thecoopnetwork.io:6877'));
    console.log(JSON.stringify(provider, null, 2));

    paramsGetTransactions = {
        requestType: 'getTransactionsBulk',
        pageSize: 3,
        page: 0
    }

    //provider.setLogger(console.log);
    let data = await provider.apiCall('get', paramsGetTransactions);
    console.log('==========' + JSON.stringify(data, null, 2));

    let blockNo = await provider.getBlockNumber();
    console.log('blockNo=' + blockNo);
}

module.exports = testProvider;