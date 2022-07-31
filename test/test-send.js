const { GMD } = require('../index');

GMD.setURL('https://node.thecoopnetwork.io:6877'); //testnet node

const TestSend = {
    test: () => {
        console.log('TestSend execute...');
        TestSend.test4();
        console.log('TestSend finished.');
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
        secretPhrase: 'screen drawn leave power connect confidence liquid everytime wall either poet shook', //testnet account GMD-N2L2-GZXR-NES8-CJMBC public key f72258e2be98b5047c0cb4ff667b48a100699bf175122027aafd4182835f3c2e
        feeNQT: '100000000',
        deadline: '15'
    };
    GMD.apiCall('post', dataSendMoney).then((res) => {
        console.log('Data received back on api calls:\n' + JSON.stringify(res, null, 2));
    });
}

TestSend.test3 = () => {
    console.log('sending 1 GMD to ALW39 from CJMBC');
    GMD.sendMoney('GMD-43MP-76UW-L69N-ALW39',
        '100000',
        'screen drawn leave power connect confidence liquid everytime wall either poet shook',
        '100000000').then(console.log);
}

TestSend.test4 = () => {
    // const dataSendMoney = {
    //     requestType: 'sendMoney',
    //     recipient: 'GMD-43MP-76UW-L69N-ALW39',
    //     amountNQT: '200000000',
    //     //secretPhrase: 'screen drawn leave power connect confidence liquid everytime wall either poet shook', //testnet account GMD-N2L2-GZXR-NES8-CJMBC public key f72258e2be98b5047c0cb4ff667b48a100699bf175122027aafd4182835f3c2e
    //     publicKey: 'f72258e2be98b5047c0cb4ff667b48a100699bf175122027aafd4182835f3c2e',
    //     feeNQT: '100000000',
    //     deadline: '15'
    // };
    // GMD.apiCall('post', dataSendMoney).then((res) => {
    //     console.log('Data received back on api calls:\n' + JSON.stringify(res, null, 2));
    // });
    GMD.createUnsignedSendMoneyTransactionRSAccount('GMD-43MP-76UW-L69N-ALW39', '100000', 'GMD-N2L2-GZXR-NES8-CJMBC', '100000000').then(
        res => {
            let unsignedTransaction = res.unsignedTransactionBytes;
            GMD.signTransaction(unsignedTransaction, 'screen drawn leave power connect confidence liquid everytime wall either poet shook').then(
                (signedTransaction) => {
                    GMD.broadcastSignedTransaction(signedTransaction).then(console.log);
                }
            );
        }
    );


}

module.exports = TestSend;