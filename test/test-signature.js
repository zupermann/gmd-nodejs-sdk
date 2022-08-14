const { GMD } = require('../index');

GMD.setURL('https://node.thecoopnetwork.io:6877'); //testnet node

const TestSignature = {};
TestSignature.test = async () => {
    console.log('TestSignature execute...');


    return GMD.generateAccount().then(async wallet => {
        console.log(JSON.stringify(wallet, null, 2));
        let messageToSign = 'This is an arbitrary message example';
        let hexMessageToSign = GMD.util.strToHex(messageToSign);
        let signature = await GMD.signHexMessagePrivateKey(hexMessageToSign, wallet.privateKey);
        console.log('signature=' + signature);
        let ret = await GMD.verifySignature(signature, hexMessageToSign, wallet.publicKey);
        console.log("Signature verification result: " + ret);
        console.log('TestSignature finished.');
    });


};

module.exports = TestSignature;