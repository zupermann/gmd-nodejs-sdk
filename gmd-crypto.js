const axios = require('./get-axios');
const crypto = require('./crypto-util');
const cryptoUtil = require('./crypto-util');

const GMD = { baseURL: 'https://node.thecoopnetwork.io' };

/**
 * 
 * @param {String} url of the GMD node. By default main net 'https://node.thecoopnetwork.io' is used.
 */
GMD.setURL = (url) => {
    GMD.baseURL = url;
}

/**
 * 
 * @param {String} unsignedTransaction bytes as hex string.
 * @param {String} passPhrase usually 12 word passphrase
 * @returns Signed transaction bytes. Signing is done locally (no passphrase is sent over noetwork)
 */
GMD.signTransaction = async (unsignedTransaction, passPhrase) => {
    const signature = await crypto.signBytes(unsignedTransaction, passPhrase);
    return unsignedTransaction.substr(0, 192) + signature + unsignedTransaction.substr(320);
}

/**
 * 
 * @param {JSON} data Transaction data JSON input. 
 * @returns boolean: true if JSON input contains properties "transactionJSON" and "unsignedTransactionBytes", false otherise.
 */
GMD.isTransaction = (data) => {
    return data &&
        data.hasOwnProperty('transactionJSON') &&
        data.hasOwnProperty('unsignedTransactionBytes');
}

/**
 * 
 * @param {JSON} data Transaction data JSON input. 
 * @returns boolean: true if json represents transaction and contains "signatureHash" and "fullHash" properties.
 */
GMD.isSignedTransactionResponse = (data) => {
    return GMD.isTransaction(data) &&
        data.hasOwnProperty('signatureHash') &&
        data.hasOwnProperty('fullHash');
};

/**
 *  API call to a GMD node. This call is done over network. 
 
 *  
 * 
 * @param {String} method HTTP method (only 'get' or 'post' are used)
 * @param {JSON} params *  Full set of API methods and parameters can be seen here: https://node.thecoopnetwork.io/test. 
 *  All parameters will be passed as a single json via 'params' parameter. Exception to this is 'secretPhrase' parameter which
 * should not be included in params, and even if you include it, the SDK will delete it before making the API call to the node.
 *  In addition to all parameters described above there are the following parameters:
 *  'requestType': [mandatory] wich is the name of the GMD API method (e.g. 'sendMoney', 'sendMessage', 'getPolls' etc..)
 *  'baseURL': [optional] URL of the GMD node where this request is performed. By default https://node.thecoopnetwork.io main net is used.
 *  'httpTimeout' [optional] parameter for HTTP request to specify a timeout when GMD node not reachable. Axios default is used if this param is not specified.
 *  Example: 
 *  params = {
        requestType: 'getAccountsBulk',
        pageSize: 3,
        page: 0,
        baseURL: 'https://node.thecoopnetwork.io:6877'
    }
 * @returns {Promise} that will resolve to the body of the server response (usually a JSON).
 */
GMD.apiCall = async (method, params) => {
    let { url, httpTimeout } = processParams(params);
    config = { method: method, url: url + '/nxt?' + (new URLSearchParams(params)).toString() };
    if (httpTimeout && httpTimeout > 0) {
        config.httpTimeout = httpTimeout;
    }
    return axios(config).then((res) => {
        console.log(`Response status on request to ${config.url} is ${res.status}\nresponse body:\n${JSON.stringify(res.data, null, 2)}`);
        return res.data;
    })
}

/**
 * GMD.apiCallAndSign() does same thing as GMD.apiCall(). In addition, if the API call returns an unsigned transaction, this method
 * will sign it using the passPhrase param and broadcast it to the network. If the response does not contain an unsigned transaction,
 * or if password is invalid, nothing happens.
 * @param {String} method - samne as GMD.apiCall()
 * @param {JSON} params - samne as GMD.apiCall()
 * @param {String} passPhrase - secret passphrase, usually 12 words that will be used to sign the transaction (never sent over network)
 * @returns Promise that will resove to a JSON with the returned details of the broadcasted transaction.
 */
GMD.apiCallAndSign = async (method, params, passPhrase) => {
    let transaction = await GMD.apiCall(method, params);
    console.log('==============1 ' + transaction);
    if (GMD.isTransaction(transaction) && !GMD.isSignedTransactionResponse(transaction) && passPhrase) {
        let signedTransaction = await GMD.signTransaction(transaction.unsignedTransactionBytes, passPhrase);
        return GMD.broadcastSignedTransaction(signedTransaction);
    }
}

processParams = (params) => {
    let url;
    let httpTimeout;
    if (params) {
        if (params.hasOwnProperty('secretPhrase')) {
            delete params.secretPhrase; //password is not sent to server - remove it from params - it is needed only to do local signing
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
    return { url, httpTimeout };
}

/**
 * Cryptographic transform of a secret to a public key. No request is sent, transformation happens locally.
 * 
 * @param {String} pass  - secret passphrase, usually 12 words.
 * @returns - public key, hex string format
 */
GMD.getPublicKey = async (pass) => {
    return crypto.getPublicKey(crypto.strToHex(pass));
}



//Helper functions

/**
 * Helper function to broadcast a signed transaction
 * @param {String} signedTransaction The signed transaction bytes in hex string format.
 * @returns {JSON} The Node response on broadcast.
 */
GMD.broadcastSignedTransaction = (signedTransaction) => {
    return GMD.apiCall('post', { requestType: 'broadcastTransaction', transactionBytes: signedTransaction }).then(data => {
        console.log('Succesfully posted the transaction broadcast. Data: ' + JSON.stringify(data, null, 2));
    }).catch(err => {
        console.log('Error posting transaction broadcast: ' + err);
    });
}

/**
 * 
 * @param {String} publicKey Public key in hex string format
 * @returns Promise that will resove to a json with account details: acount id, RS account id and public key.
 */
GMD.getAccountId = (publicKey) => {
    return GMD.apiCall('get', { requestType: 'getAccountId', publicKey: publicKey });
}

/**
 *  Getting public key from RS account is not cryptographically possible. 
 * However, the mapping RS account <-> public key is available on the node if this account exists on the chain 
 * (if at least one transaction has been made).
 */
GMD.getPublicKeyFromRS = (rsAccount) => {
    return GMD.apiCall('get', { requestType: 'getAccountPublicKey', account: rsAccount }).then(data => {
        return data.publicKey;
    })
}


/**
 * Generate full GMD account.
 * @param {String} secretPassphrase [optional ]if not provided, a secret 12 word passphrase will be generated. Generation of passphrase happens locally,
 * it is never sent on the network. Password is transformed to a public key and that key is sent to a node to get the account id details.
 * @returns a promise that resolves to a JSOM containing: account ID, RS account ID (format GMD-...), public key, secret passphrase.
 */
GMD.generateAccount = async (secretPassphrase) => {
    if (!secretPassphrase) {
        const PassPhraseGenerator = require('./pass-gen');
        secretPassphrase = PassPhraseGenerator.generatePass();
    }
    return GMD.getWalletDetailsFromPassPhrase(secretPassphrase);
}

/**
 * 
 * @param {*} secretPassphrase is transformed to a public key and that key is sent to a node to get the account id details.
 * @returns a promise that resolves to a JSON containing: account ID, RS account ID (format GMD-...), public key, secret passphrase.
 */
GMD.getWalletDetailsFromPassPhrase = async (secretPassphrase) => {
    const publicKey = await cryptoUtil.getPublicKey((cryptoUtil.strToHex(secretPassphrase)));

    return GMD.getAccountId(publicKey).then((data) => {
        data.secretPassphrase = secretPassphrase;
        return data;
    });
}

/**
 * 
 * @param {*} rsAccount 
 * @returns true if RS account checsum and format is checks out, false is invalid address. Actual check is done remotely on a Coop Network Node, so lack of connectivity will result in error thrown.
 */
GMD.checkRSAddress = async (rsAccount) => {
    return GMD.apiCall('get', { requestType: 'rsConvert', account: rsAccount }).then(data => {
        return data.hasOwnProperty('accountLongId');
    })
}

/**
 * Returns a promise that will resolve to a balanceNQT 
 */
GMD.getBalance = async (rsAccount) => {
    return GMD.apiCall('get', { requestType: 'getBalance', account: rsAccount }).then(data => {
        return data.balanceNQT;
    });
}

/**
 * Sends GMD to another wallet. The implementation does 3 operations:
 * 1. Creates an unsigned transaction for sending GMD by calling appropriate API on the node.
 * 2. Waits for the transaction created on step 1 to be received from the node and signs it locally.
 * 3. Broadcasts to the GMD nodes the signed transaction.
 * 
 * @param {String} recipient RS destination account ('GMD-...' format)
 * @param {String} amountNQT Amount to be transfered in NQT. 1 GMD = 100000000 NQT.
 * @param {String} passPhrase Secret passphrase, used for step 2, local signing.
 * @param {String} feeNQT Fee in NQT
 * @returns Promise that resolves to a JSON with broadcast restult.
 */
GMD.sendMoney = (recipient, amountNQT, passPhrase, feeNQT) => {
    return sendMoneyAPICall(true, recipient, amountNQT, passPhrase, feeNQT);
}

/**
 * Same as GMD.sendMoney(), but onyl step 1. This is usefull when the signing and broadcast is done on other device (e.g. mobile).
 * Sender is identified thorough its public key, not secret passphrase.
 * @param {String} recipient same as GMD.sendMoney()
 * @param {String} amountNQT same as GMD.sendMoney()
 * @param {String} senderPublicKey sender public key.
 * @param {String} feeNQT same as GMD.sendMoney()
 * @returns Promise that resolves to a transaction JSON. If signing on other device, create a QR code with the string found in 
 * transaction.unsignedTransactionBytes property. This string may be signed on the other device with GMD.signTransaction() (assuming 
 * the other device uses this SDK)
 */
GMD.createUnsignedSendMoneyTransaction = (recipient, amountNQT, senderPublicKey, feeNQT) => {
    return sendMoneyAPICall(false, recipient, amountNQT, senderPublicKey, feeNQT);
}

const sendMoneyAPICall = async (signIt, recipient, amountNQT, from, feeNQT) => {
    params = {
        requestType: 'sendMoney',
        recipient: recipient,
        amountNQT: amountNQT,
        feeNQT: feeNQT,
        deadline: '1440'
    }

    if (signIt) {
        params.publicKey = await GMD.getPublicKey(from);
    } else {
        params.publicKey = from;
    }
    let transaction = await GMD.apiCall('post', params);
    if (signIt) {
        if (GMD.isTransaction(transaction) && !GMD.isSignedTransactionResponse(transaction) && from) {
            let signedTransaction = await GMD.signTransaction(transaction.unsignedTransactionBytes, from);
            return GMD.broadcastSignedTransaction(signedTransaction);
        }
    } else {
        return transaction;
    }

}



module.exports = GMD;