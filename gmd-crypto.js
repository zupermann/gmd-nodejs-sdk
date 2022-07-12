const axios = require('axios');
const crypto = require('./crypto-util');

GMD = { baseURL: 'https://node.thecoopnetwork.io' };

GMD.setURL = (url) => {
    GMD.baseURL = url;
}

GMD.signTransaction = (unsignedTransaction, passPhrase) => {
    const signature = crypto.signBytes(unsignedTransaction, passPhrase);
    return unsignedTransaction.substr(0, 192) + signature + unsignedTransaction.substr(320);
}

GMD.isTransaction = (data) => {
    return data &&
        data.hasOwnProperty('transactionJSON') &&
        data.hasOwnProperty('unsignedTransactionBytes');
}

GMD.isSignedTransactionResponse = (data) => {
    return GMD.isTransaction(data) &&
        data.hasOwnProperty('signatureHash') &&
        data.hasOwnProperty('fullHash');
};

GMD.apiCall = (method, params, callback) => {
    let { pass, url, httpTimeout } = GMD.processParams(params);
    config = { method: method, url: url + '/nxt?' + (new URLSearchParams(params)).toString() };
    if (httpTimeout && httpTimeout > 0) {
        config.httpTimeout = httpTimeout;
    }
    GMD.callHttp(config, pass, callback);
}

GMD.processParams = (params) => {
    let pass = null;
    let url;
    let httpTimeout;
    if (params) {
        if (params.hasOwnProperty('secretPhrase')) {
            pass = params.secretPhrase;
            delete params.secretPhrase; //password is not sent to server - remove it from params - it is needed only to do local signing
            if (!params.hasOwnProperty('publicKey')) {
                params.publicKey = GMD.getPublicKey(pass);
            }
        }

        if (params.hasOwnProperty('httpTimeout')) {
            httpTimeout = params.httpTimeout;
            delete params.httpTimeout;
        }

        if (params.hasOwnProperty('baseURL')) {
            url = params.baseURL;
            delete params.baseURL;
        } else {
            url = GMD.baseURL;
        }
    }
    return { pass, url, httpTimeout };
}


GMD.getPublicKey = (pass) => {
    return crypto.getPublicKey(crypto.strToHex(pass));
}


GMD.callHttp = (config, pass, callback) => {
    axios(config).then((res) => {
        console.log(`Response status on request to ${config.url} is ${res.status}\nresponse body:\n${JSON.stringify(res.data, null, 2)}`);
        handleAPICallResponse(res.data, pass);
        if (callback) callback(res.data);
    }, (error) => {
        console.log(error);
        if (callback) callback(error);
    });
}

handleAPICallResponse = (data, pass) => {
    if (GMD.isTransaction(data) && !GMD.isSignedTransactionResponse(data) && pass) {
        const signature = GMD.signTransaction(data.unsignedTransactionBytes, pass);
        console.log('signature ' + signature);
        GMD.apiCall('post', { requestType: 'broadcastTransaction', transactionBytes: signature });
    }
}

module.exports = GMD;