const cryptoUtil = require('./crypto-util');
const crypto = require("./get-crypto");

const iterations = 223978;

const KeyEncryption = {};

/**
 * Encrypts message in hex format. Most common use is to encrypt private keys.
 *
 * @param {*} messageHex hex string. Most of the times this will encrypt hex string representing private and public keys.
 * If user wants to encrypt any other arbitrary message, should use KeyEncryption.encryptStr() instead.
 * messageHex should represent a whole number of bytes: i.e. an even number of hex digits. If odd number of hex digits is provided,
 * an error will be thrown. If user really wants to encrypt odd hex digits ( why!? ) he should add one 0 prefix padding.
 * @param {*} password password. It is recommented to be at minimum 8 chars, have numbers, both capital and lower case and special
 * characters, but this is not enforced in this SDK.
 * @returns a promise that resolves to an encrypted JSON. JSON contains: iv, salt, ciphertext.
 */
KeyEncryption.encryptHex = async (messageHex, password) => {
    if (messageHex && messageHex.length % 2) {
        throw new Error('Hex string to be encrypted cannot have a 0 length or have an even number of hex digits');
    }
    let { iv, salt } = await generateIvAndSalt();
    let encryptionKey = await genEncryptionKeyFromPassword(password, salt, iterations);
    let encryptedByteArray = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, encryptionKey, new Uint8Array(cryptoUtil.hexToBytes(messageHex)));
    let ciphertext = Buffer.from(encryptedByteArray).toString('hex');
    return { iv: cryptoUtil.Uint8ArrayToHex(iv), salt: cryptoUtil.Uint8ArrayToHex(salt), ciphertext: ciphertext };
};

/**
 * Same as  KeyEncryption.encryptHex() but it encrypts any string,
 * @param {*} message any string to be encrypted.
 * @param {*} password same as KeyEncryption.encryptHex()
 * @returns a promise that resolves to an encrypted JSON. JSON contains: iv, salt, ciphertext.
 */
KeyEncryption.encryptStr = async (message, password) => {
    return KeyEncryption.encryptHex(cryptoUtil.strToHex(message), password);
}

/**
 * Helper function used to decrypt to hex. Used in pair with KeyEncryption.encryptHex() most common use case is to encrypt/decrypt private key.
 * 
 * @param {*} ciphertext 
 * @param {*} password 
 * @returns a promise that resolves to the unencrypted hex string.
 */
KeyEncryption.decryptToHex = async (ciphertext, password) => {
    let decryptedData = await decrypt(ciphertext, password);
    return cryptoUtil.Uint8ArrayToHex(decryptedData);
}

/**
 * Decrypt to a string.  Used in pair with KeyEncryption.encryptStr().
 * 
 * @param {*} ciphertext 
 * @param {*} password 
 * @returns a promise that resolves to the unencrypted plain text UTF-16 encoded.
 */
KeyEncryption.decryptToStr = async (ciphertext, password) => {
    let decryptedData = await decrypt(ciphertext, password);
    return cryptoUtil.Uint8ArrayToStr(decryptedData);
}

let decrypt = async (encryptedJSON, password) => {
    if (encryptedJSON && 'iv' in encryptedJSON && 'salt' in encryptedJSON && 'ciphertext' in encryptedJSON) {
        let ciphertext = cryptoUtil.hexToUint8(encryptedJSON.ciphertext);
        let iv = cryptoUtil.hexToUint8(encryptedJSON.iv);
        let salt = cryptoUtil.hexToUint8(encryptedJSON.salt);

        let encryptionKey = await genEncryptionKeyFromPassword(password, salt, iterations);
        let result = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, encryptionKey, ciphertext);
        return new Uint8Array(result);
    } else {
        throw new Error('Encrypted JSON not correct');
    }
}

let generateIvAndSalt = async () => {
    let iv = crypto.getRandomValues(new Uint8Array(16));
    let salt = crypto.getRandomValues(new Uint8Array(16));
    return { iv: iv, salt: salt };
}

let genEncryptionKeyFromPassword = async (password, salt, iterations) => {
    let importedPassword = await crypto.subtle.importKey(
        "raw",
        cryptoUtil.strToUint8(password),
        { "name": "PBKDF2" },
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