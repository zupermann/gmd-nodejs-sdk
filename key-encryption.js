const cryptoUtil = require('./crypto-util');
const crypto = require("./get-crypto");

const iterations = 223978;

var vector = new Uint8Array([181,6,125,13,208,51,252,170,254,112,197,182,134,53,188,113]);//require("./get-crypto").getRandomValues(new Uint8Array(16));

const KeyEncryption = {};

/**
 * 
 * @param {*} messageHex hex string. Most of the times we will encrypt hex string representing private and public keys.
 * If you want to encrypt any other arbitrary message, use  KeyEncryption.encryptStr() instead.
 * @param {*} password password. It is recommented to be at minimum 8 chars, have numbers, both capital and lower case and special
 * characters, but this is not enforced here.
 * @param {*} storage User provided object to store and retrieve encryption initialization vector (IV) and encryption salt. In case
 * storage does not contain an IV and a salt, the pair and salt is generated and saved to the storage. It is manadatory to provide
 * the same IV and salt for decryption. If any of the password, IV or salt are lost, the encrpyted message cannot be decrypted.
 * The user should provide this storage as this SDK is designed to work across multiple platforms. 
 * @returns a promise that resolves to an encrypted hex string.
 */
 KeyEncryption.encryptHex = async (messageHex, password, storage) => {
    let {iv, salt} = encrParams(storage);
    let encryptionKey = await genEncryptionKeyFromPassword(password, salt, iterations);
    let encryptedByteArray = await crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, encryptionKey, new Uint8Array(cryptoUtil.hexToBytes(messageHex)));
    return Buffer.from(encryptedByteArray).toString('hex');
};

/**
 * Same as  KeyEncryption.encryptHex() but it encrypts any string,
 * @param {*} message any string to be encrypted.
 * @param {*} password same as KeyEncryption.encryptHex()
 * @param {*} storage same as KeyEncryption.encryptHex()
 */
 KeyEncryption.encryptStr = async (message, password, storage) => {
    return  KeyEncryption.encryptHex(cryptoUtil.strToHex(message), password, storage);
}

KeyEncryption.decryptToHex = async (cyphertext, password, storage) => {
    let decryptedData = await decrypt(cyphertext, password, storage);
    return cryptoUtil.Uint8ArrayToHex(decryptedData);
}

KeyEncryption.decryptToStr = async (cyphertext, password, storage) => {
    let decryptedData = await decrypt(cyphertext, password, storage);
    return cryptoUtil.Uint8ArrayToStr(decryptedData);
}

let decrypt = async (cyphertext, password, storage) => {
    let data = cryptoUtil.hexToUint8(cyphertext);
    let {iv, salt} = encrParams(storage);
    if (iv == null || salt == null) {
        throw new Error("Salt or key not found in storage. Cannot decrypt");
    }
    let encryptionKey = await genEncryptionKeyFromPassword(password, salt, iterations);
    let result = await crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, encryptionKey, data);
    return new Uint8Array(result);
}

//TODO: add storage functionality + replace iv and salt with random numbers
let encrParams = (storage) => {
    return {iv: vector, salt : cryptoUtil.strToUint8("the salt is this random string2")}
};


let genEncryptionKeyFromPassword = async (password, salt, iterations) => {
    let importedPassword = await crypto.subtle.importKey(
        "raw",
        cryptoUtil.strToUint8(password),
        {"name": "PBKDF2"},
        false,
        ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            "salt": salt,
            "iterations": iterations,
            "hash": "SHA-256"
        },
        importedPassword,
        {
            "name": "AES-GCM",
            "length": 128
        },
        false,
        ["encrypt", "decrypt"]
    );
}


module.exports = KeyEncryption;



// function encryptThenDecrypt() {
//     secretmessage = "message to be encrypted";//document.getElementById("secretmessageField").value; // some string to encrypt
//     var password = "my password";//document.getElementById("passwordField").value; // some user-chosen password

//     var promise_key = crypto.subtle.importKey(
//         "raw",
//         cryptoUtil.strToUint8Array(password),
//         {"name": "PBKDF2"},
//         false,
//         ["deriveKey"]
//     );
//     promise_key.then(function(importedPassword) {
//         return crypto.subtle.deriveKey(
//             {
//                 "name": "PBKDF2",
//                 "salt": cryptoUtil.strToUint8Array("the salt is this random string2"),
//                 "iterations": 123978,
//                 "hash": "SHA-256"
//             },
//             importedPassword,
//             {
//                 "name": "AES-GCM",
//                 "length": 128
//             },
//             false,
//             ["encrypt", "decrypt"]
//         );
//     }).then(function(key) {
//         encrypt_data(vector, key, "some message!!").then(encryptedByteArray=>{
//             let hex = Buffer.from(encryptedByteArray).toString('hex');
//             console.log("encryptedByteArray="+hex);
//             let t2 =  new Uint8Array(crptoUtil.hexToBytes(hex));
//             decrypt_data(vector, key, t2 );
//         });
//     }).catch = function(e) {
//         console.log("Error while importing key: " + e.message);
//     }
// }

// function encrypt_data(iv, key, message) {
//     var encrypt_promise = crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, new Uint8Array(cryptoUtil.hexToBytes(message)));
//     encrypt_promise.then(result => new Uint8Array(result)).catch(e=> console.log("Error while encrypting data: " + e.message));
//     return encrypt_promise;
// }

// function decrypt_data(iv, key, encrypted) {
//     var decrypt_promise = crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, encrypted);

//     decrypt_promise.then(
//         function(result){
//             var decrypted_data = new Uint8Array(result);
//             console.log("Decrypted data: " +  cryptoUtil.Uint8ArrayToStr(decrypted_data));
//         },
//         function(e) {
//             console.log("Error while decrypting data: " + e.message);
//         }
//     );
// }

// test = async ()=>{
//     try {
//         let hexCypherText = await KeyEncryption.encryptStr("some message!!","my password");
//         console.log('='+hexCypherText);
//         let decryptText = await KeyEncryption.decryptToStr(hexCypherText, "my password");
//         console.log('= decrypted text='+decryptText);
//     } catch(e) {
//         console.log('Encryption/decryption failed: '+e);
//     }
// }

// test();