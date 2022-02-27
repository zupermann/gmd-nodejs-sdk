const CryptoJS = require("crypto-js");
const curve25519 = require('./curve25519');
cryptoUtil = {};


cryptoUtil.strToHex = (str) => {
    result = '';
    for (let i=0; i<str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;   
}

cryptoUtil.hexToString = (hex) => {
    string = '';
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

cryptoUtil.SHA256 = (in1, in2) => {
    var sha256 = CryptoJS.algo.SHA256.create();
    sha256.update(cryptoUtil.bytesToWords(in1));
    if (in2) {
        sha256.update(cryptoUtil.bytesToWords(in2));
    }
    var hash = sha256.finalize();
    return cryptoUtil.wordsToBytes(hash);
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
        bytes[offset++] =  word & 0xff;
    }
    word = wordArr.words[len - 1];
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



cryptoUtil.signBytes = (message, passPhrase) => {
    const messageBytes = cryptoUtil.hexToBytes(message);
    const secretPhraseBytes = cryptoUtil.hexToBytes(cryptoUtil.strToHex(passPhrase));
    const digest = cryptoUtil.SHA256(secretPhraseBytes);
    const s = curve25519.keygen(digest).s;
    var m = cryptoUtil.SHA256(messageBytes);
    var x = cryptoUtil.SHA256(m, s);
    var y = curve25519.keygen(x).p;
    var h = cryptoUtil.SHA256(m, y);
    var v = curve25519.sign(h, x, s);
    return cryptoUtil.bytesToHex(v.concat(h));
}

cryptoUtil.getPublicKey = (passHex)=> {
    const passBytes = cryptoUtil.hexToBytes(passHex);
    const digest = cryptoUtil.SHA256(passBytes);  //TODO also get public key from RS address - request to node?
    return cryptoUtil.bytesToHex(curve25519.keygen(digest).p);
}

module.exports = cryptoUtil;