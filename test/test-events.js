const { GMD, GMDEvents } = require('../index');
GMD.setURL('https://node.thecoopnetwork.io:6877'); //testnet node

TestEvents = {};

TestEvents.test = () => {
    console.log('TestEvents.test');
}

// params = new URLSearchParams({
//     abc: "degf",
//     events: 'avcc'
// });
// params.append('evemts', '3dsgs');
// params.append('evemts', '32dsgs');
// params.append('evemts', '322dsgs');
// url = params.toString()
// console.log('=== ' + url);

// id = GMDEvents.registerEventListener((ev) => { console.log('this is a listener call') });
// console.log('GMDEvents listener added with id ' + id);
//GMDEvents.removeUniversalEventListener(id);

// require('node-cron').schedule('0 * * * *', () => {
//     console.log('tick');
// });


module.exports = TestEvents;




