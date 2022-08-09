const KeyEncryption = require("../key-encryption");

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
        cyphertext = await KeyEncryption.encryptHex(data, "Some password Example 123#^&5", storage);
    } catch (e){
        console.log('cannot encrypt: '+ e)
    }
    console.log("cyphertext:"+cyphertext);
    try {
        decryped = await KeyEncryption.decryptToHex(cyphertext, "Some password Example 123#^&5", storage);
    } catch (e){
        console.log('cannot decrypt: '+ e)
    }
    console.log("decryped:"+decryped);

}


module.exports = TestEncryption;