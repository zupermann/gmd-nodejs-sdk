const KeyEncryption = require("../key-encryption");

const TestEncryption = {};
TestEncryption.test = async () =>
{
    let data = "0ff345ba23091efeeabc33267510";
    console.log("Data to be encrypted: "+data);
    let cyphertext = await KeyEncryption.encryptHex(data, "Some password Example 123#^&5");
    console.log("cyphertext:"+cyphertext);
    let decryped = await KeyEncryption.decryptToHex(cyphertext, "Some password Example 123#^&5");
    console.log("decryped:"+decryped);

}


module.exports = TestEncryption;