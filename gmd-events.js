const GMD = require('./gmd-crypto')
const GMDEvents = {
    BLOCK_EVENTS: [
        'Block.BLOCK_GENERATED',
        'Block.BLOCK_POPPED',
        'Block.BLOCK_PUSHED'
    ],
    PEER_EVENTS: [
        'Peer.ADD_INBOUND',
        'Peer.ADDED_ACTIVE_PEER',
        'Peer.BLACKLIST',
        'Peer.CHANGED_ACTIVE_PEER',
        'Peer.DEACTIVATE',
        'Peer.NEW_PEER',
        'Peer.REMOVE',
        'Peer.REMOVE_INBOUND',
        'Peer.UNBLACKLIST'
    ],
    TRANSACTION_EVENTS: [
        'Transaction.ADDED_CONFIRMED_TRANSACTIONS',
        'Transaction.ADDED_UNCONFIRMED_TRANSACTIONS',
        'Transaction.REJECT_PHASED_TRANSACTION',
        'Transaction.RELEASE_PHASED_TRANSACTION',
        'Transaction.REMOVE_UNCONFIRMED_TRANSACTIONS'
    ]
};

GMDEvents.ALL_EVENTS = GMDEvents.BLOCK_EVENTS.concat(GMDEvents.PEER_EVENTS).concat(GMDEvents.TRANSACTION_EVENTS);

let eventListeners = [];

GMDEvents.registerEventListener = async (listener) => {

    let initialLen = eventListeners.length;
    let id = Math.floor(Math.random() * 10000000000000000);
    let count = eventListeners.push({ listener: listener, id: id });
    if (initialLen == 0 && count == 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        startListening(id);
    }
    console.log('add listener. new listeners array size: ' + eventListeners.length)
}

const startListening = (id) => {
    console.log('startListening');
    GMD.apiCall('post', { requestType: 'eventRegister', httpTimeout: 5000 }).then((res) => {
        console.log('start listening callback ' + JSON.stringify(res, null, 2));
        if (res && res.registered) {
            console.log('succesfully registered')
        } else {
            this.unRegisterEventListener(id);
        }
        eventWait();
    });
}

const eventWait = async () => {
    console.log('waiting for event...')
    while (eventListeners.length > 0) {
        GMD.apiCall('post', { requestType: 'eventWait' }).then((res) => {
            console.log("event wait response: " + JSON.stringify(res, null, 2));
            if (Object.prototype.hasOwnProperty.call(res, 'errorCode') && res.errorCode == 8) {
                console.log('No events registered');
                eventListeners.pop();
            }
        });
        await new Promise(resolve => setTimeout(resolve, 15000));
    }
    console.log('exit waiting for event loop')
}

GMDEvents.unRegisterEventListener = (id) => {
    let tempListeners = eventListeners.filter(el => el.id !== id);
    eventListeners = tempListeners;
    console.log('trying to remove listener. new listener size: ' + eventListeners.length)
}

module.exports = GMDEvents;