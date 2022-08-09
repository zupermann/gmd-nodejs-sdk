const GMD = require("../gmd-crypto");

const TestEncryption = {};

TestEncryption.test = async () => {
    let data = "0ff345ba23091efeeabc332675112a";
    console.log("==encr== Data to be encrypted: " + data);
    let encryptedJSON;
    try {
        encryptedJSON = await GMD.util.encryptHex(data, "Some password Example 123#^&5");
    } catch (e) {
        console.log('==encr== cannot encrypt: ' + e);
        return;
    }
    console.log("==encr== encryptedJSON: " + JSON.stringify(encryptedJSON, null, 2));
    try {
        decryped = await GMD.util.decryptToHex(encryptedJSON, "Some password Example 123#^&5");
        console.log("==encr== decryped:" + decryped);
    } catch (e) {
        console.log('==encr== cannot decrypt: ' + e)
    }


}


module.exports = TestEncryption;