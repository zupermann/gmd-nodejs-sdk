const { GMD } = require('../index');

GMD.setURL('https://node.thecoopnetwork.io:6877'); //testnet node

const TestSend = {
    test: () => {
        //test1();
        test2();
    }
};

// test1 = () => {
//     //let task = require('node-cron').schedule('0,15,30,45 * * * *', () => {
//     require('node-cron').schedule('* * * * *', () => {
//         const dataSendMoney = {
//             requestType: 'sendMoney',
//             recipient: 'GMD-43MP-76UW-L69N-ALW39',
//             amountNQT: '200000000',
//             secretPhrase: 'screen drawn leave power connect confidence liquid everytime wall either poet shook', //testnet account GMD-N2L2-GZXR-NES8-CJMBC
//             feeNQT: '100000000',
//             deadline: '15'
//         };

//         GMD.apiCall('post', dataSendMoney).then((res) => {
//             console.log('Data received back on api calls:\n' + JSON.stringify(res, null, 2));
//         });
//     });
// }

test2 = () => {
    const dataSendMoney = {
        requestType: 'sendMoney',
        recipient: 'GMD-43MP-76UW-L69N-ALW39',
        amountNQT: '200000000',
        secretPhrase: 'screen drawn leave power connect confidence liquid everytime wall either poet shook', //testnet account GMD-N2L2-GZXR-NES8-CJMBC
        feeNQT: '100000000',
        deadline: '15'
    };
    GMD.apiCall('post', dataSendMoney).then((res) => {
        console.log('Data received back on api calls:\n' + JSON.stringify(res, null, 2));
    });
}

module.exports = TestSend;