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

GMD.apiCall = (method, params) => {
    let { pass, url, httpTimeout } = processParams(params);
    config = { method: method, url: url + '/nxt?' + (new URLSearchParams(params)).toString() };
    if (httpTimeout && httpTimeout > 0) {
        config.httpTimeout = httpTimeout;
    }
    return GMD.callHttp(config, pass);
}

processParams = (params) => {
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


GMD.callHttp = (config, pass) => {
    return axios(config).then((res) => {
        console.log(`Response status on request to ${config.url} is ${res.status}\nresponse body:\n${JSON.stringify(res.data, null, 2)}`);
        handleAPICallResponse(res.data, pass);
        return res.data;
    })
}

handleAPICallResponse = (data, pass) => {
    if (GMD.isTransaction(data) && !GMD.isSignedTransactionResponse(data) && pass) {
        const signature = GMD.signTransaction(data.unsignedTransactionBytes, pass);
        console.log('signature ' + signature);
        GMD.apiCall('post', { requestType: 'broadcastTransaction', transactionBytes: signature }).then(data => {
            console.log('Succesfully posted the transaction broadcast. Data: ' + JSON.stringify(data, null, 2));
        }).catch(err => {
            console.log('Error posting transaction broadcast: ' + err);
        });
    }
}

//Helper functions

GMD.getAccountId = (publicKey) => {
    return GMD.apiCall('get', { requestType: 'getAccountId', publicKey: publicKey });
}

//generate full GMD account.
//Optional parameter secretPassphrase: if not provided, a secret 12 word passphrase will be generated
GMD.generateAccount = (secretPassphrase) => {
    if (!secretPassphrase) {
        const PassPhraseGenerator = require('./pass-gen');
        secretPassphrase = PassPhraseGenerator.generatePass();
    }
    const publicKey = cryptoUtil.getPublicKey((cryptoUtil.strToHex(secretPassphrase)));

    return GMD.getAccountId(publicKey).then((data) => {
        data.secretPassphrase = secretPassphrase;
        return data;
    });
}

//returns true if RS account checsum and format is checks out, false is invalid address.
//Actual check is done remotely on a Coop Network Node, so lack of connectivity will result in error thrown.
GMD.checkRSAddress = async (rsAccount) => {
    return GMD.apiCall('get', { requestType: 'rsConvert', account: rsAccount }).then(data => {
        return data.hasOwnProperty('accountLongId');
    })
}

//returns a promise that will resolve to a balanceNQT 
GMD.getBalance = async (rsAccount) => {
    return GMD.apiCall('get', { requestType: 'getBalance', account: rsAccount }).then(data => {
        return data.balanceNQT;
    });
}

module.exports = GMD;