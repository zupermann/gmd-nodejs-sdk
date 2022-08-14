const { GMD } = require('../index');

GMD.setURL('https://node.thecoopnetwork.io:6877'); //testnet node

const TestSend = {
    test: async () => {
        console.log('TestSend execute...');
        await TestSend.test5();
        console.log('TestSend finished.');
    }
};

// TestSend.test1 = () => {
//     require('node-cron').schedule('* * * * *', () => {
//         GMD.sendMoney('GMD-43MP-76UW-L69N-ALW39', '200000', 'screen drawn leave power connect confidence liquid everytime wall either poet shook', '100000000');
//     });
// }

TestSend.test2 = async () => {
    const dataSendMoney = {
        requestType: 'sendMoney',
        recipient: 'GMD-43MP-76UW-L69N-ALW39',
        amountNQT: '200000',
        publicKey: 'f72258e2be98b5047c0cb4ff667b48a100699bf175122027aafd4182835f3c2e', //testnet account GMD-N2L2-GZXR-NES8-CJMBC public key f72258e2be98b5047c0cb4ff667b48a100699bf175122027aafd4182835f3c2e
        feeNQT: '100000000',
        deadline: '15'
    };
    GMD.apiCall('post', dataSendMoney).then((res) => {
        console.log('Data received back on api calls:\n' + JSON.stringify(res, null, 2));
    });
}

TestSend.test3 = async () => {
    console.log('sending 1 GMD to ALW39 from CJMBC');
    GMD.sendMoney('GMD-43MP-76UW-L69N-ALW39',
        '100000',
        'screen drawn leave power connect confidence liquid everytime wall either poet shook',
        '100000000').then(console.log);
}

TestSend.test4 = async () => {
    GMD.createUnsignedSendMoneyTransaction('GMD-43MP-76UW-L69N-ALW39', '100000', 'f72258e2be98b5047c0cb4ff667b48a100699bf175122027aafd4182835f3c2e', '100000000')
        .then(res => GMD.signTransaction(res.unsignedTransactionBytes, 'screen drawn leave power connect confidence liquid everytime wall either poet shook')
            .then(signedTransaction => GMD.broadcastSignedTransaction(signedTransaction).then(console.log))
        );
}

TestSend.test5 = async () => {
    const data = {
        requestType: 'sendMessage',
        recipient: 'GMD-43MP-76UW-L69N-ALW39',
        message: 'This is a test message',
        publicKey: 'f72258e2be98b5047c0cb4ff667b48a100699bf175122027aafd4182835f3c2e', //testnet account GMD-N2L2-GZXR-NES8-CJMBC public key f72258e2be98b5047c0cb4ff667b48a100699bf175122027aafd4182835f3c2e
        feeNQT: '100000000',
        deadline: '1440'
    };
    return GMD.apiCallAndSign('post', data, 'screen drawn leave power connect confidence liquid everytime wall either poet shook');
}

module.exports = TestSend;