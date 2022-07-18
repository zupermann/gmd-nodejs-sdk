const { GMD } = require('../index');
TestGet = {};

TestGet.test = () => {
    test1();
    test2();
}

///////////////////////////
const test1 = () => {
    paramsGetTransactions = {
        requestType: 'getTransactionsBulk',
        pageSize: 3,
        page: 0
    }
    GMD.apiCall('get', paramsGetTransactions, (res) => {
        console.log('Result trasnactions: \n' + JSON.stringify(res, null, 2));
    })
}
//////////////////////////

//////////////////////////
const test2 = () => {
    paramsGetAccounts = {
        requestType: 'getAccountsBulk',
        pageSize: 3,
        page: 0,
        baseURL: 'https://node.thecoopnetwork.io'
    }
    GMD.apiCall('get', paramsGetAccounts).then((res) => {
        console.log('Result trasnactions: \n' + JSON.stringify(res, null, 2));
    });
}
///////////////////////////

module.exports = TestGet;