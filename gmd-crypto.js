const axios = require('./get-axios');
const crypto = require('./crypto-util');
const cryptoUtil = require('./crypto-util');

const GMD = { baseURL: 'https://node.thecoopnetwork.io' };

GMD.setURL = (url) => {
    GMD.baseURL = url;
}

GMD.signTransaction = async (unsignedTransaction, passPhrase) => {
    const signature = await crypto.signBytes(unsignedTransaction, passPhrase);
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

GMD.apiCall = async (method, params, doNotSign) => {
    let { pass, url, httpTimeout } = await processParams(params);
    config = { method: method, url: url + '/nxt?' + (new URLSearchParams(params)).toString() };
    if (httpTimeout && httpTimeout > 0) {
        config.httpTimeout = httpTimeout;
    }
    return GMD.callHttp(config, pass, doNotSign);
}

processParams = async (params) => {
    let pass = null;
    let url;
    let httpTimeout;
    if (params) {
        if (params.hasOwnProperty('secretPhrase')) {
            pass = params.secretPhrase;
            delete params.secretPhrase; //password is not sent to server - remove it from params - it is needed only to do local signing
            if (!params.hasOwnProperty('publicKey')) {
                params.publicKey = await GMD.getPublicKey(pass);
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


GMD.getPublicKey = async (pass) => {
    return crypto.getPublicKey(crypto.strToHex(pass));
}


GMD.callHttp = (config, pass, doNotSign) => {
    return axios(config).then((res) => {
        console.log(`Response status on request to ${config.url} is ${res.status}\nresponse body:\n${JSON.stringify(res.data, null, 2)}`);
        return handleAPICallResponse(res.data, pass, doNotSign);;
    })
}

handleAPICallResponse = async (data, pass, doNotSign) => {
    if (doNotSign) {
        return data;
    }
    if (GMD.isTransaction(data) && !GMD.isSignedTransactionResponse(data) && pass) {
        const signature = await GMD.signTransaction(data.unsignedTransactionBytes, pass);
        console.log('signature ' + signature);
        GMD.apiCall('post', { requestType: 'broadcastTransaction', transactionBytes: signature }).then(data => {
            console.log('Succesfully posted the transaction broadcast. Data: ' + JSON.stringify(data, null, 2));
        }).catch(err => {
            console.log('Error posting transaction broadcast: ' + err);
        });
    }
    return data;
}

//Helper functions

GMD.getAccountId = (publicKey) => {
    return GMD.apiCall('get', { requestType: 'getAccountId', publicKey: publicKey });
}

//generate full GMD account.
//Optional parameter secretPassphrase: if not provided, a secret 12 word passphrase will be generated
GMD.generateAccount = async (secretPassphrase) => {
    if (!secretPassphrase) {
        const PassPhraseGenerator = require('./pass-gen');
        secretPassphrase = PassPhraseGenerator.generatePass();
    }
    const publicKey = await cryptoUtil.getPublicKey((cryptoUtil.strToHex(secretPassphrase)));

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

GMD.sendMoney = (recipient, amountNQT, passPhrase, feeNQT) => {
    return GMD.apiCall('post', {
        requestType: 'sendMoney',
        recipient: recipient,
        amountNQT: amountNQT,
        secretPhrase: passPhrase,
        feeNQT: feeNQT,
        deadline: '1440'
    });
}

module.exports = GMD;