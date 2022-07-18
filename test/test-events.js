const { GMD, GMDEvents } = require('../index');
GMD.setURL('https://node.thecoopnetwork.io:6877'); //testnet node

TestEvents = {};

TestEvents.test = async () => {
    console.log('TestEvents.test');


    // params = new URLSearchParams({
    //     abc: "degf",
    //     events: 'avcc'
    // });
    // params.append('evemts', '3dsgs');
    // params.append('evemts', '32dsgs');
    // params.append('evemts', '322dsgs');
    // url = params.toString()
    // console.log('=== ' + url);

    id = GMDEvents.registerEventListener((ev) => { console.log('this is a listener call: ' + JSON.stringify(ev)) });
    console.log('GMDEvents listener added with id ' + id);

    await new Promise(resolve => setTimeout(resolve, 90000));


    GMDEvents.unRegisterEventListener(id);
}

module.exports = TestEvents;




