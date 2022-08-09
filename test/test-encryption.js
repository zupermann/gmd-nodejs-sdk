const GMD = require("../gmd-crypto");

const TestEncryption = {};

let storage = {store : {}}


storage.getItem = (keyName) => {
    if(keyName in storage.store){
        return storage.store[keyName];
    } else {
        return null;
    }
},
storage.setItem = (keyName, keyValue) => {
    storage.store[keyName] = keyValue;
}


TestEncryption.test = async () =>
{
    let data = "0ff345ba23091efeeabc33267510";
    let cyphertext, decryped;
    console.log("Data to be encrypted: "+data);
    try {
        cyphertext = await GMD.util.encryptHex(data, "Some password Example 123#^&5", storage);
    } catch (e){
        console.log('cannot encrypt: '+ e)
    }
    console.log("cyphertext:"+cyphertext);
    try {
        decryped = await GMD.util.decryptToHex(cyphertext, "Some password Example 123#^&5", storage);
    } catch (e){
        console.log('cannot decrypt: '+ e)
    }
    console.log("decryped:"+decryped);

}


module.exports = TestEncryption;