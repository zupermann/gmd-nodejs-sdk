const { GMD } = require('../index');
TestGet = {};

TestGet.test = async () => {
    await test1();
    await test2();
}

///////////////////////////
const test1 = async () => {
    paramsGetTransactions = {
        requestType: 'getTransactionsBulk',
        pageSize: 3,
        page: 0
    }
    return GMD.apiCall('get', paramsGetTransactions, (res) => {
        console.log('Result trasnactions: \n' + JSON.stringify(res, null, 2));
    })
}
//////////////////////////

//////////////////////////
const test2 = async () => {
    paramsGetAccounts = {
        requestType: 'getAccountsBulk',
        pageSize: 3,
        page: 0,
        baseURL: 'https://node.thecoopnetwork.io'
    }
    return GMD.apiCall('get', paramsGetAccounts).then((res) => {
        console.log('Result trasnactions: \n' + JSON.stringify(res, null, 2));
    });
}
///////////////////////////

module.exports = TestGet;