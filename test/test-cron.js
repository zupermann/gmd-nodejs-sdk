const { GMD } = require('../index');

GMD.setURL('https://node.thecoopnetwork.io:6877'); //testnet node

const TestCron = {
    test: () => {
        test1();
    }
};

test1 = () => {
    let count = 0;
    //let task = require('node-cron').schedule('0,15,30,45 * * * *', () => {
    let task = require('node-cron').schedule('* * * * *', () => {
        const dataSendMoney = {
            requestType: 'sendMoney',
            recipient: 'GMD-43MP-76UW-L69N-ALW39',
            amountNQT: '200000000',
            secretPhrase: 'screen drawn leave power connect confidence liquid everytime wall either poet shook', //testnet account GMD-N2L2-GZXR-NES8-CJMBC
            feeNQT: '100000000',
            deadline: '15'
        };

        GMD.apiCall('post', dataSendMoney, (res) => {
            console.log('This is a callback example. Data received back on api calls:\n' + JSON.stringify(res, null, 2));
        });
        if (count++ > 1) { //execute 3 times
            console.log('stopping test');
            task.stop();
        }
    });
}

module.exports = TestCron;