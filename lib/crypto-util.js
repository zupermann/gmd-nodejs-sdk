const webcrypto = require('./get-crypto');
const curve25519 = require('./curve25519');
const RSAddress = require('./rs-address');
const cryptoUtil = {};


cryptoUtil.strToHex = (str) => {
    let result = '';
    cryptoUtil.strToBytes(str).forEach(c => result += c.toString(16));
    return result;
}

cryptoUtil.strToBytes = (str) => {
    let result = [];
    for (let i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
    }
    return result;
}

cryptoUtil.hexToString = (hex) => {
    let string = '';
    for (let i = 0; i < hex.length; i += 2) {
        string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return string;
}

cryptoUtil.hexToBytes = (hex) => {
    for (var bytes = [], c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}

cryptoUtil.bytesToHex = (byteArray) => {
    return Array.from(byteArray, (byte) => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

cryptoUtil.strToUint8 = str => new Uint8Array(cryptoUtil.strToBytes(str));

cryptoUtil.hexToUint8 = hex => new Uint8Array(cryptoUtil.hexToBytes(hex));

cryptoUtil.Uint8ArrayToStr = (buffer) => {
    let string = '';
    for (let i = 0; i < buffer.length; i++) {
        string += String.fromCharCode(buffer[i]);
    }
    return string;
}

cryptoUtil.Uint8ArrayToHex = (buffer) => {
    var array = Array.from(buffer);
    return cryptoUtil.bytesToHex(array);
}


cryptoUtil.bytesToWords = (byteArray) => {
    let i = 0, offset = 0, word = 0;
    const len = byteArray.length;
    var words = new Uint32Array(((len / 4) | 0) + (len % 4 == 0 ? 0 : 1));

    while (i < (len - (len % 4))) {
        words[offset++] = (byteArray[i++] << 24) | (byteArray[i++] << 16) | (byteArray[i++] << 8) | (byteArray[i++]);
    }
    if (len % 4 != 0) {
        word = byteArray[i++] << 24;
        if (len % 4 > 1) {
            word = word | byteArray[i++] << 16;
        }
        if (len % 4 > 2) {
            word = word | byteArray[i++] << 8;
        }
        words[offset] = word;
    }
    var wordArr = new Object();
    wordArr.sigBytes = len;
    wordArr.words = words;

    return wordArr;
}

cryptoUtil.bytesToString = (bytesArray) => {
    return String.fromCharCode.apply(null, bytesArray);
}

cryptoUtil.SHA256 = async (in1, in2) => {
    let input;
    if (in1) {
        if (in2) {
            input = in1.concat(in2);
        } else {
            input = in1;
        }
    } else {
        if (in2) {
            input = in2;
        }
    }

    let arrayBufferInput = Uint8Array.from(input);
    let output = await webcrypto.subtle.digest('SHA-256', arrayBufferInput);
    return Array.from(new Uint8Array(output));
}


cryptoUtil.wordsToBytes = (wordArr) => {
    const len = wordArr.words.length;
    if (len == 0) {
        return new Array(0);
    }
    const bytes = new Array(wordArr.sigBytes);
    let offset = 0;

    for (let i = 0; i < len - 1; i++) {
        let word = wordArr.words[i];
        bytes[offset++] = (word >> 24) & 0xff;
        bytes[offset++] = (word >> 16) & 0xff;
        bytes[offset++] = (word >> 8) & 0xff;
        bytes[offset++] = word & 0xff;
    }
    let word = wordArr.words[len - 1];
    bytes[offset++] = (word >> 24) & 0xff;
    if (wordArr.sigBytes % 4 == 0) {
        bytes[offset++] = (word >> 16) & 0xff;
        bytes[offset++] = (word >> 8) & 0xff;
        bytes[offset++] = word & 0xff;
    }
    if (wordArr.sigBytes % 4 > 1) {
        bytes[offset++] = (word >> 16) & 0xff;
    }
    if (wordArr.sigBytes % 4 > 2) {
        bytes[offset++] = (word >> 8) & 0xff;
    }
    return bytes;
}



cryptoUtil.signBytes = async (message, passPhrase) => {
    let privateKey = await cryptoUtil.getPrivateKey(passPhrase);
    return cryptoUtil.signBytesPrivateKey(message, privateKey);
}

cryptoUtil.signBytesPrivateKey = async (message, privateKey) => {
    let messageBytes = cryptoUtil.hexToBytes(message);
    let s = cryptoUtil.hexToBytes(privateKey);
    let m = await cryptoUtil.SHA256(messageBytes);
    let x = await cryptoUtil.SHA256(m, s);
    let y = curve25519.keygen(x).p;
    let h = await cryptoUtil.SHA256(m, y);
    let v = curve25519.sign(h, x, s);
    return cryptoUtil.bytesToHex(v.concat(h));
}

cryptoUtil.verifySignature = async (signature, unsignedMessage, publicKey) => {
    let signatureBytes = cryptoUtil.hexToBytes(signature);
    let messageBytes = cryptoUtil.hexToBytes(unsignedMessage);
    let publicKeyBytes = cryptoUtil.hexToBytes(publicKey)
    let v = signatureBytes.slice(0, 32);
    let h = signatureBytes.slice(32);
    let Y = curve25519.verify(v, h, publicKeyBytes);

    let m = await cryptoUtil.SHA256(messageBytes);
    let h2 = await cryptoUtil.SHA256(m, Y);

    return cryptoUtil.byteArraysEqual(h, h2);
}

cryptoUtil.byteArraysEqual = (bytes1, bytes2) => {
    if (bytes1.length !== bytes2.length) {
        return false;
    }
    for (var i = 0; i < bytes1.length; ++i) {
        if (bytes1[i] !== bytes2[i]) {
            return false;
        }
    }
    return true;
}


cryptoUtil.getPrivateKey = async (pass) => {
    let { privateKey } = await cryptoUtil.getWalletDetails(pass);
    return privateKey;
}

cryptoUtil.getPublicKey = async (pass) => {
    let { publicKey } = await cryptoUtil.getWalletDetails(pass);
    return publicKey;
}

cryptoUtil.getWalletDetails = async (passPhrase) => {
    let seed = await cryptoUtil.getSeed(passPhrase);
    return cryptoUtil.getWalletDetailsFromSeed(seed);
}


cryptoUtil.getWalletDetailsFromSeed = async (seed) => {
    let { p, s } = curve25519.keygen(seed);
    let publicKey = cryptoUtil.bytesToHex(p);
    let privateKey = cryptoUtil.bytesToHex(s);
    let accountId = await cryptoUtil.publicKeyToAccountId(publicKey);
    return { publicKey: publicKey, privateKey: privateKey, accountId: accountId }
}

cryptoUtil.getSeed = async (passPhrase) => {
    return cryptoUtil.SHA256(cryptoUtil.strToBytes(passPhrase));
}

cryptoUtil.hexToDec = (hex) => {
    if (hex.length % 2) {
        hex = '0' + hex;
    }
    return BigInt('0x' + hex).toString(10);
};

cryptoUtil.publicKeyToAccountId = async (publicKeyHex) => {
    let sha256digest = await cryptoUtil.SHA256(cryptoUtil.hexToBytes(publicKeyHex));
    let accountIdBytes = sha256digest.slice(0, 8).reverse(); // Most siginificant byte is on the right.
    let accountId = cryptoUtil.hexToDec(cryptoUtil.bytesToHex(accountIdBytes));
    return accountId;
}

cryptoUtil.accountIdToRS = (accountId) => {
    let rsaddr = new RSAddress();
    rsaddr.set(accountId);
    return rsaddr.toString();
}

cryptoUtil.publicKeyToRSAccount = async (publicKeyHex) => {
    let accountId = await cryptoUtil.publicKeyToAccountId(publicKeyHex);
    return cryptoUtil.accountIdToRS(accountId);
}




module.exports = cryptoUtil;