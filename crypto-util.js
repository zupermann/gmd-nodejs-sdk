const crypto = require('./get-crypto');
const curve25519 = require('./curve25519');
const cryptoUtil = {};


cryptoUtil.strToHex = (str) => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16);
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
    let output = await crypto.subtle.digest('SHA-256', arrayBufferInput);
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

cryptoUtil.getPrivateKeyFromPassPhrase = async (passPhrase) => {
    let secretPhraseBytes = cryptoUtil.hexToBytes(cryptoUtil.strToHex(passPhrase));
    let digest = await cryptoUtil.SHA256(secretPhraseBytes);
    let privatekey = curve25519.keygen(digest).s;
    return cryptoUtil.bytesToHex(privatekey);
}

cryptoUtil.signBytes = async (message, passPhrase)=>{
    let privateKey = await cryptoUtil.getPrivateKeyFromPassPhrase(passPhrase);
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

cryptoUtil.getPublicKey = async (passHex) => {
    const passBytes = cryptoUtil.hexToBytes(passHex);
    const digest = await cryptoUtil.SHA256(passBytes);
    return cryptoUtil.bytesToHex(curve25519.keygen(digest).p);
}

module.exports = cryptoUtil;