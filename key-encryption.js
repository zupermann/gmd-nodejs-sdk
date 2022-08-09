const cryptoUtil = require('./crypto-util');
const crypto = require("./get-crypto");

const iterations = 223978;

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
    let {iv, salt} = await generateAndStoreIvAndSalt(storage);
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
    let {iv, salt} = await getIvAndSalt(storage);
    let encryptionKey = await genEncryptionKeyFromPassword(password, salt, iterations);
    let result = await crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, encryptionKey, data);
    return new Uint8Array(result);
}

let generateAndStoreIvAndSalt = async (storage) => {
    let iv = crypto.getRandomValues(new Uint8Array(16));
    let salt = crypto.getRandomValues(new Uint8Array(16));
    await storage.setItem('gmd-sdk-enc-iv', cryptoUtil.Uint8ArrayToHex(iv));
    await storage.setItem('gmd-sdk-enc-salt', cryptoUtil.Uint8ArrayToHex(salt));
    return {iv: iv, salt: salt};
}

let getIvAndSalt = async (storage) => {
    let ivHex = storage.getItem('gmd-sdk-enc-iv');
    let saltHex = storage.getItem('gmd-sdk-enc-salt');
    if( ivHex == null || saltHex == null){
        throw new Error("Initialization vector or salt not found in local storage");
    }  
    return {iv: cryptoUtil.hexToUint8(ivHex), salt: cryptoUtil.hexToUint8(saltHex)};
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