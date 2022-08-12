(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* eslint-disable no-undef */
module.exports = axios;
},{}],2:[function(require,module,exports){
module.exports = window.crypto;
},{}],3:[function(require,module,exports){
var { GMD } = require('../index');
window.GMD = GMD;
},{"../index":8}],4:[function(require,module,exports){
const crypto = require('./get-crypto');
const curve25519 = require('./curve25519');
const cryptoUtil = {};


cryptoUtil.strToHex = (str) => {
    let result = '';
    cryptoUtil.strToBytes(str).forEach(c=> result+=c.toString(16));
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



cryptoUtil.signBytes = async (message, passPhrase)=>{
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
    let v = signatureBytes.slice(0,32);
    let h = signatureBytes.slice(32);
    let Y = curve25519.verify(v, h, publicKeyBytes);

    let m = await cryptoUtil.SHA256(messageBytes);
    let h2 = await cryptoUtil.SHA256(m, Y);

    return cryptoUtil.byteArraysEqual(h,h2);
}

cryptoUtil.byteArraysEqual  = (bytes1, bytes2) => {
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
    let {privateKey} = await cryptoUtil.getPublicPrivateKey(pass);
    return privateKey;
}

cryptoUtil.getPublicKey = async (pass) => {
    let {publicKey} = await cryptoUtil.getPublicPrivateKey(pass);
    return publicKey;
}

cryptoUtil.getPublicPrivateKey = async (passPhrase) => {
    let seed = await this.getSeed(passPhrase);
    return cryptoUtil.getPublicPrivateKeyFromSeed(seed);
}


cryptoUtil.getPublicPrivateKeyFromSeed = (seed) => {
    let {p,s} = curve25519.keygen(seed);
    return {publicKey: cryptoUtil.bytesToHex(p), privateKey: cryptoUtil.bytesToHex(s) }
}

cryptoUtil.getSeed = async (passPhrase) => {
    return cryptoUtil.SHA256(cryptoUtil.strToBytes(passPhrase));
}

// cryptoUtil.getEncryptedJSONFromPassPhrase = async (passPhrase) => {
//     let seed = await this.getSeed(passPhrase);
//     //KeyEncryption.
// }


module.exports = cryptoUtil;
},{"./curve25519":5,"./get-crypto":2}],5:[function(require,module,exports){
/* Ported to JavaScript from Java 07/01/14.
 *
 * Ported from C to Java by Dmitry Skiba [sahn0], 23/02/08.
 * Original: http://cds.xs4all.nl:8081/ecdh/
 */
/* Generic 64-bit integer implementation of Curve25519 ECDH
 * Written by Matthijs van Duin, 200608242056
 * Public domain.
 *
 * Based on work by Daniel J Bernstein, http://cr.yp.to/ecdh.html
 */

var curve25519 = function () {

    //region Constants

    var KEY_SIZE = 32;

    /* array length */
    var UNPACKED_SIZE = 16;

    /* group order (a prime near 2^252+2^124) */
    var ORDER = [
        237, 211, 245, 92,
        26, 99, 18, 88,
        214, 156, 247, 162,
        222, 249, 222, 20,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 16
    ];

    /* smallest multiple of the order that's >= 2^255 */
    var ORDER_TIMES_8 = [
        104, 159, 174, 231,
        210, 24, 147, 192,
        178, 230, 188, 23,
        245, 206, 247, 166,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 128
    ];

    /* constants 2Gy and 1/(2Gy) */
    var BASE_2Y = [
        22587, 610, 29883, 44076,
        15515, 9479, 25859, 56197,
        23910, 4462, 17831, 16322,
        62102, 36542, 52412, 16035
    ];

    var BASE_R2Y = [
        5744, 16384, 61977, 54121,
        8776, 18501, 26522, 34893,
        23833, 5823, 55924, 58749,
        24147, 14085, 13606, 6080
    ];

    var C1 = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var C9 = [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var C486671 = [0x6D0F, 0x0007, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var C39420360 = [0x81C8, 0x0259, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var P25 = 33554431; /* (1 << 25) - 1 */
    var P26 = 67108863; /* (1 << 26) - 1 */

    //#endregion

    //region Key Agreement

    /* Private key clamping
     *   k [out] your private key for key agreement
     *   k  [in]  32 random bytes
     */
    function clamp(k) {
        k[31] &= 0x7F;
        k[31] |= 0x40;
        k[0] &= 0xF8;
    }

    //endregion

    //region radix 2^8 math

    function cpy32(d, s) {
        for (var i = 0; i < 32; i++)
            d[i] = s[i];
    }

    /* p[m..n+m-1] = q[m..n+m-1] + z * x */
    /* n is the size of x */
    /* n+m is the size of p and q */
    function mula_small(p, q, m, x, n, z) {
        m = m | 0;
        n = n | 0;
        z = z | 0;

        var v = 0;
        for (var i = 0; i < n; ++i) {
            v += (q[i + m] & 0xFF) + z * (x[i] & 0xFF);
            p[i + m] = (v & 0xFF);
            v >>= 8;
        }

        return v;
    }

    /* p += x * y * z  where z is a small integer
     * x is size 32, y is size t, p is size 32+t
     * y is allowed to overlap with p+32 if you don't care about the upper half  */
    function mula32(p, x, y, t, z) {
        t = t | 0;
        z = z | 0;

        var n = 31;
        var w = 0;
        var i = 0;
        for (; i < t; i++) {
            var zy = z * (y[i] & 0xFF);
            w += mula_small(p, p, i, x, n, zy) + (p[i + n] & 0xFF) + zy * (x[n] & 0xFF);
            p[i + n] = w & 0xFF;
            w >>= 8;
        }
        p[i + n] = (w + (p[i + n] & 0xFF)) & 0xFF;
        return w >> 8;
    }

    /* divide r (size n) by d (size t), returning quotient q and remainder r
     * quotient is size n-t+1, remainder is size t
     * requires t > 0 && d[t-1] !== 0
     * requires that r[-1] and d[-1] are valid memory locations
     * q may overlap with r+t */
    function divmod(q, r, n, d, t) {
        n = n | 0;
        t = t | 0;

        var rn = 0;
        var dt = (d[t - 1] & 0xFF) << 8;
        if (t > 1)
            dt |= (d[t - 2] & 0xFF);

        while (n-- >= t) {
            var z = (rn << 16) | ((r[n] & 0xFF) << 8);
            if (n > 0)
                z |= (r[n - 1] & 0xFF);

            var i = n - t + 1;
            z /= dt;
            rn += mula_small(r, r, i, d, t, -z);
            q[i] = (z + rn) & 0xFF;
            /* rn is 0 or -1 (underflow) */
            mula_small(r, r, i, d, t, -rn);
            rn = r[n] & 0xFF;
            r[n] = 0;
        }

        r[t - 1] = rn & 0xFF;
    }

    function numsize(x, n) {
        // eslint-disable-next-line no-empty
        while (n-- !== 0 && x[n] === 0) { }
        return n + 1;
    }

    /* Returns x if a contains the gcd, y if b.
     * Also, the returned buffer contains the inverse of a mod b,
     * as 32-byte signed.
     * x and y must have 64 bytes space for temporary use.
     * requires that a[-1] and b[-1] are valid memory locations  */
    function egcd32(x, y, a, b) {
        var an, bn = 32, qn, i;
        for (i = 0; i < 32; i++)
            x[i] = y[i] = 0;
        x[0] = 1;
        an = numsize(a, 32);
        if (an === 0)
            return y; /* division by zero */
        var temp = new Array(32);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            qn = bn - an + 1;
            divmod(temp, b, bn, a, an);
            bn = numsize(b, bn);
            if (bn === 0)
                return x;
            mula32(y, x, temp, qn, -1);

            qn = an - bn + 1;
            divmod(temp, a, an, b, bn);
            an = numsize(a, an);
            if (an === 0)
                return y;
            mula32(x, y, temp, qn, -1);
        }
    }

    //endregion

    //region radix 2^25.5 GF(2^255-19) math

    //region pack / unpack

    /* Convert to internal format from little-endian byte format */
    function unpack(x, m) {
        for (var i = 0; i < KEY_SIZE; i += 2)
            x[i / 2] = m[i] & 0xFF | ((m[i + 1] & 0xFF) << 8);
    }

    /* Check if reduced-form input >= 2^255-19 */
    function is_overflow(x) {
        return (
            ((x[0] > P26 - 19)) &&
            ((x[1] & x[3] & x[5] & x[7] & x[9]) === P25) &&
            ((x[2] & x[4] & x[6] & x[8]) === P26)
        ) || (x[9] > P25);
    }

    /* Convert from internal format to little-endian byte format.  The
     * number must be in a reduced form which is output by the following ops:
     *     unpack, mul, sqr
     *     set --  if input in range 0 .. P25
     * If you're unsure if the number is reduced, first multiply it by 1.  */
    function pack(x, m) {
        for (var i = 0; i < UNPACKED_SIZE; ++i) {
            m[2 * i] = x[i] & 0x00FF;
            m[2 * i + 1] = (x[i] & 0xFF00) >> 8;
        }
    }

    //endregion

    function createUnpackedArray() {
        return new Uint16Array(UNPACKED_SIZE);
    }

    /* Copy a number */
    function cpy(d, s) {
        for (var i = 0; i < UNPACKED_SIZE; ++i)
            d[i] = s[i];
    }

    /* Set a number to value, which must be in range -185861411 .. 185861411 */
    function set(d, s) {
        d[0] = s;
        for (var i = 1; i < UNPACKED_SIZE; ++i)
            d[i] = 0;
    }

    /* Add/subtract two numbers.  The inputs must be in reduced form, and the
     * output isn't, so to do another addition or subtraction on the output,
     * first multiply it by one to reduce it. */
    var add = c255laddmodp;
    var sub = c255lsubmodp;

    /* Multiply a number by a small integer in range -185861411 .. 185861411.
     * The output is in reduced form, the input x need not be.  x and xy may point
     * to the same buffer. */
    var mul_small = c255lmulasmall;

    /* Multiply two numbers.  The output is in reduced form, the inputs need not be. */
    var mul = c255lmulmodp;

    /* Square a number.  Optimization of  mul25519(x2, x, x)  */
    var sqr = c255lsqrmodp;

    /* Calculates a reciprocal.  The output is in reduced form, the inputs need not
     * be.  Simply calculates  y = x^(p-2)  so it's not too fast. */
    /* When sqrtassist is true, it instead calculates y = x^((p-5)/8) */
    function recip(y, x, sqrtassist) {
        var t0 = createUnpackedArray();
        var t1 = createUnpackedArray();
        var t2 = createUnpackedArray();
        var t3 = createUnpackedArray();
        var t4 = createUnpackedArray();

        /* the chain for x^(2^255-21) is straight from djb's implementation */
        var i;
        sqr(t1, x); /*  2 === 2 * 1	*/
        sqr(t2, t1); /*  4 === 2 * 2	*/
        sqr(t0, t2); /*  8 === 2 * 4	*/
        mul(t2, t0, x); /*  9 === 8 + 1	*/
        mul(t0, t2, t1); /* 11 === 9 + 2	*/
        sqr(t1, t0); /* 22 === 2 * 11	*/
        mul(t3, t1, t2); /* 31 === 22 + 9 === 2^5   - 2^0	*/
        sqr(t1, t3); /* 2^6   - 2^1	*/
        sqr(t2, t1); /* 2^7   - 2^2	*/
        sqr(t1, t2); /* 2^8   - 2^3	*/
        sqr(t2, t1); /* 2^9   - 2^4	*/
        sqr(t1, t2); /* 2^10  - 2^5	*/
        mul(t2, t1, t3); /* 2^10  - 2^0	*/
        sqr(t1, t2); /* 2^11  - 2^1	*/
        sqr(t3, t1); /* 2^12  - 2^2	*/
        for (i = 1; i < 5; i++) {
            sqr(t1, t3);
            sqr(t3, t1);
        } /* t3 */ /* 2^20  - 2^10	*/
        mul(t1, t3, t2); /* 2^20  - 2^0	*/
        sqr(t3, t1); /* 2^21  - 2^1	*/
        sqr(t4, t3); /* 2^22  - 2^2	*/
        for (i = 1; i < 10; i++) {
            sqr(t3, t4);
            sqr(t4, t3);
        } /* t4 */ /* 2^40  - 2^20	*/
        mul(t3, t4, t1); /* 2^40  - 2^0	*/
        for (i = 0; i < 5; i++) {
            sqr(t1, t3);
            sqr(t3, t1);
        } /* t3 */ /* 2^50  - 2^10	*/
        mul(t1, t3, t2); /* 2^50  - 2^0	*/
        sqr(t2, t1); /* 2^51  - 2^1	*/
        sqr(t3, t2); /* 2^52  - 2^2	*/
        for (i = 1; i < 25; i++) {
            sqr(t2, t3);
            sqr(t3, t2);
        } /* t3 */ /* 2^100 - 2^50 */
        mul(t2, t3, t1); /* 2^100 - 2^0	*/
        sqr(t3, t2); /* 2^101 - 2^1	*/
        sqr(t4, t3); /* 2^102 - 2^2	*/
        for (i = 1; i < 50; i++) {
            sqr(t3, t4);
            sqr(t4, t3);
        } /* t4 */ /* 2^200 - 2^100 */
        mul(t3, t4, t2); /* 2^200 - 2^0	*/
        for (i = 0; i < 25; i++) {
            sqr(t4, t3);
            sqr(t3, t4);
        } /* t3 */ /* 2^250 - 2^50	*/
        mul(t2, t3, t1); /* 2^250 - 2^0	*/
        sqr(t1, t2); /* 2^251 - 2^1	*/
        sqr(t2, t1); /* 2^252 - 2^2	*/
        if (sqrtassist !== 0) {
            mul(y, x, t2); /* 2^252 - 3 */
        } else {
            sqr(t1, t2); /* 2^253 - 2^3	*/
            sqr(t2, t1); /* 2^254 - 2^4	*/
            sqr(t1, t2); /* 2^255 - 2^5	*/
            mul(y, t1, t0); /* 2^255 - 21	*/
        }
    }

    /* checks if x is "negative", requires reduced input */
    function is_negative(x) {
        var isOverflowOrNegative = is_overflow(x) || x[9] < 0;
        var leastSignificantBit = x[0] & 1;
        return ((isOverflowOrNegative ? 1 : 0) ^ leastSignificantBit) & 0xFFFFFFFF;
    }

    /* a square root */
    function sqrt(x, u) {
        var v = createUnpackedArray();
        var t1 = createUnpackedArray();
        var t2 = createUnpackedArray();

        add(t1, u, u); /* t1 = 2u		*/
        recip(v, t1, 1); /* v = (2u)^((p-5)/8)	*/
        sqr(x, v); /* x = v^2		*/
        mul(t2, t1, x); /* t2 = 2uv^2		*/
        sub(t2, t2, C1); /* t2 = 2uv^2-1		*/
        mul(t1, v, t2); /* t1 = v(2uv^2-1)	*/
        mul(x, u, t1); /* x = uv(2uv^2-1)	*/
    }

    //endregion

    //region JavaScript Fast Math

    function c255lsqr8h(a7, a6, a5, a4, a3, a2, a1, a0) {
        var r = [];
        var v;
        r[0] = (v = a0 * a0) & 0xFFFF;
        r[1] = (v = ((v / 0x10000) | 0) + 2 * a0 * a1) & 0xFFFF;
        r[2] = (v = ((v / 0x10000) | 0) + 2 * a0 * a2 + a1 * a1) & 0xFFFF;
        r[3] = (v = ((v / 0x10000) | 0) + 2 * a0 * a3 + 2 * a1 * a2) & 0xFFFF;
        r[4] = (v = ((v / 0x10000) | 0) + 2 * a0 * a4 + 2 * a1 * a3 + a2 * a2) & 0xFFFF;
        r[5] = (v = ((v / 0x10000) | 0) + 2 * a0 * a5 + 2 * a1 * a4 + 2 * a2 * a3) & 0xFFFF;
        r[6] = (v = ((v / 0x10000) | 0) + 2 * a0 * a6 + 2 * a1 * a5 + 2 * a2 * a4 + a3 * a3) & 0xFFFF;
        r[7] = (v = ((v / 0x10000) | 0) + 2 * a0 * a7 + 2 * a1 * a6 + 2 * a2 * a5 + 2 * a3 * a4) & 0xFFFF;
        r[8] = (v = ((v / 0x10000) | 0) + 2 * a1 * a7 + 2 * a2 * a6 + 2 * a3 * a5 + a4 * a4) & 0xFFFF;
        r[9] = (v = ((v / 0x10000) | 0) + 2 * a2 * a7 + 2 * a3 * a6 + 2 * a4 * a5) & 0xFFFF;
        r[10] = (v = ((v / 0x10000) | 0) + 2 * a3 * a7 + 2 * a4 * a6 + a5 * a5) & 0xFFFF;
        r[11] = (v = ((v / 0x10000) | 0) + 2 * a4 * a7 + 2 * a5 * a6) & 0xFFFF;
        r[12] = (v = ((v / 0x10000) | 0) + 2 * a5 * a7 + a6 * a6) & 0xFFFF;
        r[13] = (v = ((v / 0x10000) | 0) + 2 * a6 * a7) & 0xFFFF;
        r[14] = (v = ((v / 0x10000) | 0) + a7 * a7) & 0xFFFF;
        r[15] = ((v / 0x10000) | 0);
        return r;
    }

    function c255lsqrmodp(r, a) {
        var x = c255lsqr8h(a[15], a[14], a[13], a[12], a[11], a[10], a[9], a[8]);
        var z = c255lsqr8h(a[7], a[6], a[5], a[4], a[3], a[2], a[1], a[0]);
        var y = c255lsqr8h(a[15] + a[7], a[14] + a[6], a[13] + a[5], a[12] + a[4], a[11] + a[3], a[10] + a[2], a[9] + a[1], a[8] + a[0]);

        var v;
        r[0] = (v = 0x800000 + z[0] + (y[8] - x[8] - z[8] + x[0] - 0x80) * 38) & 0xFFFF;
        r[1] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[1] + (y[9] - x[9] - z[9] + x[1]) * 38) & 0xFFFF;
        r[2] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[2] + (y[10] - x[10] - z[10] + x[2]) * 38) & 0xFFFF;
        r[3] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[3] + (y[11] - x[11] - z[11] + x[3]) * 38) & 0xFFFF;
        r[4] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[4] + (y[12] - x[12] - z[12] + x[4]) * 38) & 0xFFFF;
        r[5] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[5] + (y[13] - x[13] - z[13] + x[5]) * 38) & 0xFFFF;
        r[6] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[6] + (y[14] - x[14] - z[14] + x[6]) * 38) & 0xFFFF;
        r[7] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[7] + (y[15] - x[15] - z[15] + x[7]) * 38) & 0xFFFF;
        r[8] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[8] + y[0] - x[0] - z[0] + x[8] * 38) & 0xFFFF;
        r[9] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[9] + y[1] - x[1] - z[1] + x[9] * 38) & 0xFFFF;
        r[10] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[10] + y[2] - x[2] - z[2] + x[10] * 38) & 0xFFFF;
        r[11] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[11] + y[3] - x[3] - z[3] + x[11] * 38) & 0xFFFF;
        r[12] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[12] + y[4] - x[4] - z[4] + x[12] * 38) & 0xFFFF;
        r[13] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[13] + y[5] - x[5] - z[5] + x[13] * 38) & 0xFFFF;
        r[14] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[14] + y[6] - x[6] - z[6] + x[14] * 38) & 0xFFFF;
        var r15 = 0x7fff80 + ((v / 0x10000) | 0) + z[15] + y[7] - x[7] - z[7] + x[15] * 38;
        c255lreduce(r, r15);
    }

    function c255lmul8h(a7, a6, a5, a4, a3, a2, a1, a0, b7, b6, b5, b4, b3, b2, b1, b0) {
        var r = [];
        var v;
        r[0] = (v = a0 * b0) & 0xFFFF;
        r[1] = (v = ((v / 0x10000) | 0) + a0 * b1 + a1 * b0) & 0xFFFF;
        r[2] = (v = ((v / 0x10000) | 0) + a0 * b2 + a1 * b1 + a2 * b0) & 0xFFFF;
        r[3] = (v = ((v / 0x10000) | 0) + a0 * b3 + a1 * b2 + a2 * b1 + a3 * b0) & 0xFFFF;
        r[4] = (v = ((v / 0x10000) | 0) + a0 * b4 + a1 * b3 + a2 * b2 + a3 * b1 + a4 * b0) & 0xFFFF;
        r[5] = (v = ((v / 0x10000) | 0) + a0 * b5 + a1 * b4 + a2 * b3 + a3 * b2 + a4 * b1 + a5 * b0) & 0xFFFF;
        r[6] = (v = ((v / 0x10000) | 0) + a0 * b6 + a1 * b5 + a2 * b4 + a3 * b3 + a4 * b2 + a5 * b1 + a6 * b0) & 0xFFFF;
        r[7] = (v = ((v / 0x10000) | 0) + a0 * b7 + a1 * b6 + a2 * b5 + a3 * b4 + a4 * b3 + a5 * b2 + a6 * b1 + a7 * b0) & 0xFFFF;
        r[8] = (v = ((v / 0x10000) | 0) + a1 * b7 + a2 * b6 + a3 * b5 + a4 * b4 + a5 * b3 + a6 * b2 + a7 * b1) & 0xFFFF;
        r[9] = (v = ((v / 0x10000) | 0) + a2 * b7 + a3 * b6 + a4 * b5 + a5 * b4 + a6 * b3 + a7 * b2) & 0xFFFF;
        r[10] = (v = ((v / 0x10000) | 0) + a3 * b7 + a4 * b6 + a5 * b5 + a6 * b4 + a7 * b3) & 0xFFFF;
        r[11] = (v = ((v / 0x10000) | 0) + a4 * b7 + a5 * b6 + a6 * b5 + a7 * b4) & 0xFFFF;
        r[12] = (v = ((v / 0x10000) | 0) + a5 * b7 + a6 * b6 + a7 * b5) & 0xFFFF;
        r[13] = (v = ((v / 0x10000) | 0) + a6 * b7 + a7 * b6) & 0xFFFF;
        r[14] = (v = ((v / 0x10000) | 0) + a7 * b7) & 0xFFFF;
        r[15] = ((v / 0x10000) | 0);
        return r;
    }

    function c255lmulmodp(r, a, b) {
        // Karatsuba multiplication scheme: x*y = (b^2+b)*x1*y1 - b*(x1-x0)*(y1-y0) + (b+1)*x0*y0
        var x = c255lmul8h(a[15], a[14], a[13], a[12], a[11], a[10], a[9], a[8], b[15], b[14], b[13], b[12], b[11], b[10], b[9], b[8]);
        var z = c255lmul8h(a[7], a[6], a[5], a[4], a[3], a[2], a[1], a[0], b[7], b[6], b[5], b[4], b[3], b[2], b[1], b[0]);
        var y = c255lmul8h(a[15] + a[7], a[14] + a[6], a[13] + a[5], a[12] + a[4], a[11] + a[3], a[10] + a[2], a[9] + a[1], a[8] + a[0],
            b[15] + b[7], b[14] + b[6], b[13] + b[5], b[12] + b[4], b[11] + b[3], b[10] + b[2], b[9] + b[1], b[8] + b[0]);

        var v;
        r[0] = (v = 0x800000 + z[0] + (y[8] - x[8] - z[8] + x[0] - 0x80) * 38) & 0xFFFF;
        r[1] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[1] + (y[9] - x[9] - z[9] + x[1]) * 38) & 0xFFFF;
        r[2] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[2] + (y[10] - x[10] - z[10] + x[2]) * 38) & 0xFFFF;
        r[3] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[3] + (y[11] - x[11] - z[11] + x[3]) * 38) & 0xFFFF;
        r[4] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[4] + (y[12] - x[12] - z[12] + x[4]) * 38) & 0xFFFF;
        r[5] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[5] + (y[13] - x[13] - z[13] + x[5]) * 38) & 0xFFFF;
        r[6] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[6] + (y[14] - x[14] - z[14] + x[6]) * 38) & 0xFFFF;
        r[7] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[7] + (y[15] - x[15] - z[15] + x[7]) * 38) & 0xFFFF;
        r[8] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[8] + y[0] - x[0] - z[0] + x[8] * 38) & 0xFFFF;
        r[9] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[9] + y[1] - x[1] - z[1] + x[9] * 38) & 0xFFFF;
        r[10] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[10] + y[2] - x[2] - z[2] + x[10] * 38) & 0xFFFF;
        r[11] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[11] + y[3] - x[3] - z[3] + x[11] * 38) & 0xFFFF;
        r[12] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[12] + y[4] - x[4] - z[4] + x[12] * 38) & 0xFFFF;
        r[13] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[13] + y[5] - x[5] - z[5] + x[13] * 38) & 0xFFFF;
        r[14] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[14] + y[6] - x[6] - z[6] + x[14] * 38) & 0xFFFF;
        var r15 = 0x7fff80 + ((v / 0x10000) | 0) + z[15] + y[7] - x[7] - z[7] + x[15] * 38;
        c255lreduce(r, r15);
    }

    function c255lreduce(a, a15) {
        var v = a15;
        a[15] = v & 0x7FFF;
        v = ((v / 0x8000) | 0) * 19;
        for (var i = 0; i <= 14; ++i) {
            a[i] = (v += a[i]) & 0xFFFF;
            v = ((v / 0x10000) | 0);
        }

        a[15] += v;
    }

    function c255laddmodp(r, a, b) {
        var v;
        r[0] = (v = (((a[15] / 0x8000) | 0) + ((b[15] / 0x8000) | 0)) * 19 + a[0] + b[0]) & 0xFFFF;
        for (var i = 1; i <= 14; ++i)
            r[i] = (v = ((v / 0x10000) | 0) + a[i] + b[i]) & 0xFFFF;

        r[15] = ((v / 0x10000) | 0) + (a[15] & 0x7FFF) + (b[15] & 0x7FFF);
    }

    function c255lsubmodp(r, a, b) {
        var v;
        r[0] = (v = 0x80000 + (((a[15] / 0x8000) | 0) - ((b[15] / 0x8000) | 0) - 1) * 19 + a[0] - b[0]) & 0xFFFF;
        for (var i = 1; i <= 14; ++i)
            r[i] = (v = ((v / 0x10000) | 0) + 0x7fff8 + a[i] - b[i]) & 0xFFFF;

        r[15] = ((v / 0x10000) | 0) + 0x7ff8 + (a[15] & 0x7FFF) - (b[15] & 0x7FFF);
    }

    function c255lmulasmall(r, a, m) {
        var v;
        r[0] = (v = a[0] * m) & 0xFFFF;
        for (var i = 1; i <= 14; ++i)
            r[i] = (v = ((v / 0x10000) | 0) + a[i] * m) & 0xFFFF;

        var r15 = ((v / 0x10000) | 0) + a[15] * m;
        c255lreduce(r, r15);
    }

    //endregion

    /********************* Elliptic curve *********************/

    /* y^2 = x^3 + 486662 x^2 + x  over GF(2^255-19) */

    /* t1 = ax + az
     * t2 = ax - az  */
    function mont_prep(t1, t2, ax, az) {
        add(t1, ax, az);
        sub(t2, ax, az);
    }

    /* A = P + Q   where
     *  X(A) = ax/az
     *  X(P) = (t1+t2)/(t1-t2)
     *  X(Q) = (t3+t4)/(t3-t4)
     *  X(P-Q) = dx
     * clobbers t1 and t2, preserves t3 and t4  */
    function mont_add(t1, t2, t3, t4, ax, az, dx) {
        mul(ax, t2, t3);
        mul(az, t1, t4);
        add(t1, ax, az);
        sub(t2, ax, az);
        sqr(ax, t1);
        sqr(t1, t2);
        mul(az, t1, dx);
    }

    /* B = 2 * Q   where
     *  X(B) = bx/bz
     *  X(Q) = (t3+t4)/(t3-t4)
     * clobbers t1 and t2, preserves t3 and t4  */
    function mont_dbl(t1, t2, t3, t4, bx, bz) {
        sqr(t1, t3);
        sqr(t2, t4);
        mul(bx, t1, t2);
        sub(t2, t1, t2);
        mul_small(bz, t2, 121665);
        add(t1, t1, bz);
        mul(bz, t1, t2);
    }

    /* Y^2 = X^3 + 486662 X^2 + X
     * t is a temporary  */
    function x_to_y2(t, y2, x) {
        sqr(t, x);
        mul_small(y2, x, 486662);
        add(t, t, y2);
        add(t, t, C1);
        mul(y2, t, x);
    }

    /* P = kG   and  s = sign(P)/k  */
    function core(Px, s, k, Gx) {
        var dx = createUnpackedArray();
        var t1 = createUnpackedArray();
        var t2 = createUnpackedArray();
        var t3 = createUnpackedArray();
        var t4 = createUnpackedArray();
        var x = [createUnpackedArray(), createUnpackedArray()];
        var z = [createUnpackedArray(), createUnpackedArray()];
        var i, j;

        /* unpack the base */
        if (Gx !== null)
            unpack(dx, Gx);
        else
            set(dx, 9);

        /* 0G = point-at-infinity */
        set(x[0], 1);
        set(z[0], 0);

        /* 1G = G */
        cpy(x[1], dx);
        set(z[1], 1);

        for (i = 32; i-- !== 0;) {
            for (j = 8; j-- !== 0;) {
                /* swap arguments depending on bit */
                var bit1 = (k[i] & 0xFF) >> j & 1;
                var bit0 = ~(k[i] & 0xFF) >> j & 1;
                var ax = x[bit0];
                var az = z[bit0];
                var bx = x[bit1];
                var bz = z[bit1];

                /* a' = a + b	*/
                /* b' = 2 b	*/
                mont_prep(t1, t2, ax, az);
                mont_prep(t3, t4, bx, bz);
                mont_add(t1, t2, t3, t4, ax, az, dx);
                mont_dbl(t1, t2, t3, t4, bx, bz);
            }
        }

        recip(t1, z[0], 0);
        mul(dx, x[0], t1);

        pack(dx, Px);

        /* calculate s such that s abs(P) = G  .. assumes G is std base point */
        if (s !== null) {
            x_to_y2(t2, t1, dx); /* t1 = Py^2  */
            recip(t3, z[1], 0); /* where Q=P+G ... */
            mul(t2, x[1], t3); /* t2 = Qx  */
            add(t2, t2, dx); /* t2 = Qx + Px  */
            add(t2, t2, C486671); /* t2 = Qx + Px + Gx + 486662  */
            sub(dx, dx, C9); /* dx = Px - Gx  */
            sqr(t3, dx); /* t3 = (Px - Gx)^2  */
            mul(dx, t2, t3); /* dx = t2 (Px - Gx)^2  */
            sub(dx, dx, t1); /* dx = t2 (Px - Gx)^2 - Py^2  */
            sub(dx, dx, C39420360); /* dx = t2 (Px - Gx)^2 - Py^2 - Gy^2  */
            mul(t1, dx, BASE_R2Y); /* t1 = -Py  */

            if (is_negative(t1) !== 0)    /* sign is 1, so just copy  */
                cpy32(s, k);
            else            /* sign is -1, so negate  */
                mula_small(s, ORDER_TIMES_8, 0, k, 32, -1);

            /* reduce s mod q
             * (is this needed?  do it just in case, it's fast anyway) */
            //divmod((dstptr) t1, s, 32, order25519, 32);

            /* take reciprocal of s mod q */
            var temp1 = new Array(32);
            var temp2 = new Array(64);
            var temp3 = new Array(64);
            cpy32(temp1, ORDER);
            cpy32(s, egcd32(temp2, temp3, s, temp1));
            if ((s[31] & 0x80) !== 0)
                mula_small(s, s, 0, ORDER, 32, 1);

        }
    }

    /********* DIGITAL SIGNATURES *********/

    /* deterministic EC-KCDSA
     *
     *    s is the private key for signing
     *    P is the corresponding public key
     *    Z is the context data (signer public key or certificate, etc)
     *
     * signing:
     *
     *    m = hash(Z, message)
     *    x = hash(m, s)
     *    keygen25519(Y, NULL, x);
     *    r = hash(Y);
     *    h = m XOR r
     *    sign25519(v, h, x, s);
     *
     *    output (v,r) as the signature
     *
     * verification:
     *
     *    m = hash(Z, message);
     *    h = m XOR r
     *    verify25519(Y, v, h, P)
     *
     *    confirm  r === hash(Y)
     *
     * It would seem to me that it would be simpler to have the signer directly do
     * h = hash(m, Y) and send that to the recipient instead of r, who can verify
     * the signature by checking h === hash(m, Y).  If there are any problems with
     * such a scheme, please let me know.
     *
     * Also, EC-KCDSA (like most DS algorithms) picks x random, which is a waste of
     * perfectly good entropy, but does allow Y to be calculated in advance of (or
     * parallel to) hashing the message.
     */

    /* Signature generation primitive, calculates (x-h)s mod q
     *   h  [in]  signature hash (of message, signature pub key, and context data)
     *   x  [in]  signature private key
     *   s  [in]  private key for signing
     * returns signature value on success, undefined on failure (use different x or h)
     */

    function sign(h, x, s) {
        // v = (x - h) s  mod q
        var w, i;
        var h1 = new Array(32)
        var x1 = new Array(32);
        var tmp1 = new Array(64);
        var tmp2 = new Array(64);

        // Don't clobber the arguments, be nice!
        cpy32(h1, h);
        cpy32(x1, x);

        // Reduce modulo group order
        var tmp3 = new Array(32);
        divmod(tmp3, h1, 32, ORDER, 32);
        divmod(tmp3, x1, 32, ORDER, 32);

        // v = x1 - h1
        // If v is negative, add the group order to it to become positive.
        // If v was already positive we don't have to worry about overflow
        // when adding the order because v < ORDER and 2*ORDER < 2^256
        var v = new Array(32);
        mula_small(v, x1, 0, h1, 32, -1);
        mula_small(v, v, 0, ORDER, 32, 1);

        // tmp1 = (x-h)*s mod q
        mula32(tmp1, v, s, 32, 1);
        divmod(tmp2, tmp1, 64, ORDER, 32);

        for (w = 0, i = 0; i < 32; i++)
            w |= v[i] = tmp1[i];

        return w !== 0 ? v : undefined;
    }

    /* Signature verification primitive, calculates Y = vP + hG
     *   v  [in]  signature value
     *   h  [in]  signature hash
     *   P  [in]  public key
     *   Returns signature public key
     */
    function verify(v, h, P) {
        /* Y = v abs(P) + h G  */
        var d = new Array(32);
        var p = [createUnpackedArray(), createUnpackedArray()];
        var s = [createUnpackedArray(), createUnpackedArray()];
        var yx = [createUnpackedArray(), createUnpackedArray(), createUnpackedArray()];
        var yz = [createUnpackedArray(), createUnpackedArray(), createUnpackedArray()];
        var t1 = [createUnpackedArray(), createUnpackedArray(), createUnpackedArray()];
        var t2 = [createUnpackedArray(), createUnpackedArray(), createUnpackedArray()];

        var vi = 0, hi = 0, di = 0, nvh = 0, i, j, k;

        /* set p[0] to G and p[1] to P  */

        set(p[0], 9);
        unpack(p[1], P);

        /* set s[0] to P+G and s[1] to P-G  */

        /* s[0] = (Py^2 + Gy^2 - 2 Py Gy)/(Px - Gx)^2 - Px - Gx - 486662  */
        /* s[1] = (Py^2 + Gy^2 + 2 Py Gy)/(Px - Gx)^2 - Px - Gx - 486662  */

        x_to_y2(t1[0], t2[0], p[1]); /* t2[0] = Py^2  */
        sqrt(t1[0], t2[0]); /* t1[0] = Py or -Py  */
        j = is_negative(t1[0]); /*      ... check which  */
        add(t2[0], t2[0], C39420360); /* t2[0] = Py^2 + Gy^2  */
        mul(t2[1], BASE_2Y, t1[0]); /* t2[1] = 2 Py Gy or -2 Py Gy  */
        sub(t1[j], t2[0], t2[1]); /* t1[0] = Py^2 + Gy^2 - 2 Py Gy  */
        add(t1[1 - j], t2[0], t2[1]); /* t1[1] = Py^2 + Gy^2 + 2 Py Gy  */
        cpy(t2[0], p[1]); /* t2[0] = Px  */
        sub(t2[0], t2[0], C9); /* t2[0] = Px - Gx  */
        sqr(t2[1], t2[0]); /* t2[1] = (Px - Gx)^2  */
        recip(t2[0], t2[1], 0); /* t2[0] = 1/(Px - Gx)^2  */
        mul(s[0], t1[0], t2[0]); /* s[0] = t1[0]/(Px - Gx)^2  */
        sub(s[0], s[0], p[1]); /* s[0] = t1[0]/(Px - Gx)^2 - Px  */
        sub(s[0], s[0], C486671); /* s[0] = X(P+G)  */
        mul(s[1], t1[1], t2[0]); /* s[1] = t1[1]/(Px - Gx)^2  */
        sub(s[1], s[1], p[1]); /* s[1] = t1[1]/(Px - Gx)^2 - Px  */
        sub(s[1], s[1], C486671); /* s[1] = X(P-G)  */
        mul_small(s[0], s[0], 1); /* reduce s[0] */
        mul_small(s[1], s[1], 1); /* reduce s[1] */

        /* prepare the chain  */
        for (i = 0; i < 32; i++) {
            vi = (vi >> 8) ^ (v[i] & 0xFF) ^ ((v[i] & 0xFF) << 1);
            hi = (hi >> 8) ^ (h[i] & 0xFF) ^ ((h[i] & 0xFF) << 1);
            nvh = ~(vi ^ hi);
            di = (nvh & (di & 0x80) >> 7) ^ vi;
            di ^= nvh & (di & 0x01) << 1;
            di ^= nvh & (di & 0x02) << 1;
            di ^= nvh & (di & 0x04) << 1;
            di ^= nvh & (di & 0x08) << 1;
            di ^= nvh & (di & 0x10) << 1;
            di ^= nvh & (di & 0x20) << 1;
            di ^= nvh & (di & 0x40) << 1;
            d[i] = di & 0xFF;
        }

        di = ((nvh & (di & 0x80) << 1) ^ vi) >> 8;

        /* initialize state */
        set(yx[0], 1);
        cpy(yx[1], p[di]);
        cpy(yx[2], s[0]);
        set(yz[0], 0);
        set(yz[1], 1);
        set(yz[2], 1);

        /* y[0] is (even)P + (even)G
         * y[1] is (even)P + (odd)G  if current d-bit is 0
         * y[1] is (odd)P + (even)G  if current d-bit is 1
         * y[2] is (odd)P + (odd)G
         */

        vi = 0;
        hi = 0;

        /* and go for it! */
        for (i = 32; i-- !== 0;) {
            vi = (vi << 8) | (v[i] & 0xFF);
            hi = (hi << 8) | (h[i] & 0xFF);
            di = (di << 8) | (d[i] & 0xFF);

            for (j = 8; j-- !== 0;) {
                mont_prep(t1[0], t2[0], yx[0], yz[0]);
                mont_prep(t1[1], t2[1], yx[1], yz[1]);
                mont_prep(t1[2], t2[2], yx[2], yz[2]);

                k = ((vi ^ vi >> 1) >> j & 1)
                    + ((hi ^ hi >> 1) >> j & 1);
                mont_dbl(yx[2], yz[2], t1[k], t2[k], yx[0], yz[0]);

                k = (di >> j & 2) ^ ((di >> j & 1) << 1);
                mont_add(t1[1], t2[1], t1[k], t2[k], yx[1], yz[1],
                    p[di >> j & 1]);

                mont_add(t1[2], t2[2], t1[0], t2[0], yx[2], yz[2],
                    s[((vi ^ hi) >> j & 2) >> 1]);
            }
        }

        k = (vi & 1) + (hi & 1);
        recip(t1[0], yz[k], 0);
        mul(t1[1], yx[k], t1[0]);

        var Y = [];
        pack(t1[1], Y);
        return Y;
    }

    /* Key-pair generation
     *   P  [out] your public key
     *   s  [out] your private key for signing
     *   k  [out] your private key for key agreement
     *   k  [in]  32 random bytes
     * s may be NULL if you don't care
     *
     * WARNING: if s is not NULL, this function has data-dependent timing */
    function keygen(k) {
        var P = [];
        var s = [];
        k = k || [];
        clamp(k);
        core(P, s, k, null);

        return { p: P, s: s, k: k };
    }

    return {
        sign: sign,
        verify: verify,
        keygen: keygen
    };
}();


module.exports = curve25519;

},{}],6:[function(require,module,exports){
const axios = require('./get-axios');
const cryptoUtil = require('./crypto-util');
const KeyEncryption = require('./key-encryption');
const Wallet = require('./lib/wallet');

const GMD = {
    baseURL: 'https://node.thecoopnetwork.io',
    util: {}
};

/**
 *
 * @param {String} url of the GMD node. By default main net 'https://node.thecoopnetwork.io' is used.
 */
GMD.setURL = (url) => {
    GMD.baseURL = url;
}

/**
 *
 * @param {String} unsignedTransaction bytes as hex string.
 * @param {String} passPhrase usually 12 word passphrase
 * @returns [async] Signed transaction bytes. Signing is done locally (no passphrase is sent over noetwork)
 */
GMD.signTransaction = async (unsignedTransaction, passPhrase) => {
    let privateKey = await cryptoUtil.getPrivateKey(passPhrase);
    return GMD.signTransactionPrivateKey(unsignedTransaction, privateKey);
}

/**
 * 
 * @param {string} message arbitrarary message; 
 * @param {*} privateKey private key in hex string format
 * @returns signature in hex string format
 */
GMD.signHexMessagePrivateKey = async (message, privateKey) => {
    return await cryptoUtil.signBytesPrivateKey(message, privateKey);
}

/**
 * Same as signHexMessagePrivateKey() except passphrase is received as param.
 * 
 * @param {string} message arbitrarary message in hex string format; 
 * @param {*} passPhrase usually 12 words
 * @returns signature in hex string format
 */
GMD.signMessage = async (message, passPhrase) => {
    let privateKey = await cryptoUtil.getPrivateKey(passPhrase);
    return GMD.signHexMessagePrivateKey(message, privateKey);
}

/**
 * This call verifies a signature against a public key. Returns true if the message was signed by the 
 * corresponding private key.
 * 
 * @param {*} signature Signature in hex string format (same format as returned by GMD.signMessage())
 * @param {*} unsignedHexMessage Message in hex string format.
 * @param {*} publicKey Public key to check the signature.
 * @returns promise that resolves to boolean.
 */
GMD.verifySignature = async (signature, unsignedHexMessage, publicKey) => {
    return cryptoUtil.verifySignature(signature, unsignedHexMessage, publicKey);
}

/**
 *
 * @param {String} unsignedTransaction transaction bytes as hex string.
 * @param {String} privateKey hex string private key
 * @returns [async] Signed transaction bytes. Signing is done locally (no passphrase is sent over noetwork)
 */
GMD.signTransactionPrivateKey = async (unsignedTransaction, privateKey) => {
    const signature = await cryptoUtil.signBytesPrivateKey(unsignedTransaction, privateKey);
    return unsignedTransaction.substr(0, 192) + signature + unsignedTransaction.substr(320);
}

/**
 * 
 * @param {string} str string
 * @returns hex string
 */
GMD.util.strToHex = (str) => {
    return cryptoUtil.strToHex(str);
}

GMD.util.encryptHex = async (messageHex, password) => {
    return KeyEncryption.encryptHex(messageHex, password);
}

GMD.util.decryptToHex = async (encryptedJSON, password) => {
    return KeyEncryption.decryptToHex(encryptedJSON, password);
}

/**
 *
 * @param {JSON} data Transaction data JSON input.
 * @returns boolean: true if JSON input contains properties "transactionJSON" and "unsignedTransactionBytes", false otherise.
 */
GMD.isTransaction = (data) => {
    return data && 'transactionJSON' in data && 'unsignedTransactionBytes' in data;
}

// const hasProperty = (obj, key) => {
//     return Object.prototype.hasOwnProperty.call(obj, key);
// }

/**
 *
 * @param {JSON} data Transaction data JSON input.
 * @returns boolean: true if json represents transaction and contains "signatureHash" and "fullHash" properties.
 */
GMD.isSignedTransactionResponse = (data) => {
    return GMD.isTransaction(data) && 'signatureHash' in data && 'fullHash' in data;
};

/**
 *  API call to a GMD node. This call is done over network.

 *
 *
 * @param {String} method HTTP method (only 'get' or 'post' are used)
 * @param {JSON} params *  Full set of API methods and parameters can be seen here: https://node.thecoopnetwork.io/test.
 *  All parameters will be passed as a single json via 'params' parameter. Exception to this is 'secretPhrase' parameter which
 * should not be included in params, and even if you include it, the SDK will delete it before making the API call to the node.
 *  In addition to all parameters described above there are the following parameters:
 *  'requestType': [mandatory] wich is the name of the GMD API method (e.g. 'sendMoney', 'sendMessage', 'getPolls' etc..)
 *  'baseURL': [optional] URL of the GMD node where this request is performed. By default https://node.thecoopnetwork.io main net is used.
 *  'httpTimeout' [optional] parameter for HTTP request to specify a timeout when GMD node not reachable. Axios default is used if this param is not specified.
 *  Example:
 *  params = {
        requestType: 'getAccountsBulk',
        pageSize: 3,
        page: 0,
        baseURL: 'https://node.thecoopnetwork.io:6877'
    }
 * @returns {Promise} that will resolve to the body of the server response (usually a JSON).
 */
GMD.apiCall = async (method, params) => {
    const { url, httpTimeout } = processParams(params);
    const config = { method, url: url + '/nxt?' + (new URLSearchParams(params)).toString() };
    if (httpTimeout && httpTimeout > 0) {
        config.httpTimeout = httpTimeout;
    }
    return axios(config).then((res) => {
        console.log(`Response status on request to ${config.url} is ${res.status}\nresponse body:\n${JSON.stringify(res.data, null, 2)}`);
        return res.data;
    })
}

/**
 * GMD.apiCallAndSign() does same thing as GMD.apiCall(). In addition, if the API call returns an unsigned transaction, this method
 * will sign it using the passPhrase param and broadcast it to the network. If the response does not contain an unsigned transaction,
 * or if password is invalid, nothing happens.
 * @param {String} method - samne as GMD.apiCall()
 * @param {JSON} params - samne as GMD.apiCall()
 * @param {String} passPhrase - secret passphrase, usually 12 words that will be used to sign the transaction (never sent over network)
 * @returns Promise that will resove to a JSON with the returned details of the broadcasted transaction.
 */
GMD.apiCallAndSign = async (method, params, passPhrase) => {
    let privateKey = await cryptoUtil.getPrivateKey(passPhrase);
    return GMD.apiCallAndSignPrivateKey(method, params, privateKey);
}

/**
 * GMD.apiCallAndSignPrivateKey() does same thing as GMD.apiCall(). In addition, if the API call returns an unsigned transaction, this method
 * will sign it using the passPhrase param and broadcast it to the network. If the response does not contain an unsigned transaction,
 * or if password is invalid, nothing happens.
 * @param {String} method - samne as GMD.apiCall()
 * @param {JSON} params - samne as GMD.apiCall()
 * @param {String} privateKey - private key string in hex format
 */
GMD.apiCallAndSignPrivateKey = async (method, params, privateKey) => {
    const transaction = await GMD.apiCall(method, params);
    if (GMD.isTransaction(transaction) && !GMD.isSignedTransactionResponse(transaction) && privateKey) {
        const signedTransaction = await GMD.signTransactionPrivateKey(transaction.unsignedTransactionBytes, privateKey);
        return GMD.broadcastSignedTransaction(signedTransaction);
    }
}

const processParams = (params) => {
    let url;
    let httpTimeout;
    if (params) {
        if ('secretPhrase' in params) {
            delete params.secretPhrase; // password is not sent to server - remove it from params - it is needed only to do local signing
        }
        if ('httpTimeout' in params) {
            httpTimeout = params.httpTimeout;
            delete params.httpTimeout;
        }

        if ('baseURL' in params) {
            url = params.baseURL;
            delete params.baseURL;
        } else {
            url = GMD.baseURL;
        }
    }
    return { url, httpTimeout };
}

/**
 * Cryptographic transform of a secret to a public key. No request is sent, transformation happens locally.
 *
 * @param {String} pass  - secret passphrase, usually 12 words.
 * @returns - public key, hex string format
 */
GMD.getPublicKey = async (pass) => {
    return cryptoUtil.getPublicKey(pass);
}

// Helper functions

/**
 * Helper function to broadcast a signed transaction
 * @param {String} signedTransaction The signed transaction bytes in hex string format.
 * @returns {JSON} The Node response on broadcast.
 */
GMD.broadcastSignedTransaction = (signedTransaction) => {
    return GMD.apiCall('post', { requestType: 'broadcastTransaction', transactionBytes: signedTransaction }).then(data => {
        console.log('Succesfully posted the transaction broadcast. Data: ' + JSON.stringify(data, null, 2));
    }).catch(err => {
        console.log('Error posting transaction broadcast: ' + err);
    });
}

/**
 *
 * @param {String} publicKey Public key in hex string format
 * @returns Promise that will resove to a json with account details: acount id, RS account id and public key.
 */
GMD.getAccountId = (publicKey) => {
    return GMD.apiCall('get', { requestType: 'getAccountId', publicKey });
}

/**
 *  Getting public key from RS account is not cryptographically possible.
 * However, the mapping RS account <-> public key is available on the node if this account exists on the chain
 * (if at least one transaction has been made).
 */
GMD.getPublicKeyFromRS = (rsAccount) => {
    return GMD.apiCall('get', { requestType: 'getAccountPublicKey', account: rsAccount }).then(data => {
        return data.publicKey;
    });
}

GMD.getWalletFromEncryptedJSON = async (encryptedJSON, encryptionPassword) => {
    let seed = await KeyEncryption.decryptToBytes(encryptedJSON, encryptionPassword);
    let {publicKey, privateKey} = cryptoUtil.getPublicPrivateKeyFromSeed(seed);
    return new Wallet(publicKey, privateKey);
};

GMD.generateWallet = async () => {
    let secretPassphrase = require('./pass-gen').generatePass();
    return GMD.generateWalletFromPassphrase(secretPassphrase);
}

GMD.generateWalletFromPassphrase = async (secretPassphrase) => {
    let {publicKey, privateKey} = await cryptoUtil.getPublicPrivateKey(secretPassphrase);
    return new Wallet(publicKey, privateKey);
};

GMD.getEncryptedJSONFromPassphrase = async (passPhrase, encryptionPassword) => {
    let seed = await cryptoUtil.getSeed(passPhrase);
    return KeyEncryption.encryptBytes(seed, encryptionPassword);
}

/**
 * Generate full GMD account.
 * @param {String} secretPassphrase [optional ]if not provided, a secret 12 word passphrase will be generated. Generation of passphrase happens locally,
 * it is never sent on the network. Password is transformed to a public key and that key is sent to a node to get the account id details.
 * @returns a promise that resolves to a JSOM containing: account ID, RS account ID (format GMD-...), public key, secret passphrase.
 */
GMD.generateAccount = async (secretPassphrase) => {
    if (!secretPassphrase) {
        const PassPhraseGenerator = require('./pass-gen');
        secretPassphrase = PassPhraseGenerator.generatePass();
    }
    return GMD.getWalletDetailsFromPassPhrase(secretPassphrase);
}

/**
 *
 * @param {*} secretPassphrase is transformed to a public key and that key is sent to a node to get the account id details.
 * @returns a promise that resolves to a JSON containing: account ID, RS account ID (format GMD-...), public key, private key, secret passphrase.
 */
GMD.getWalletDetailsFromPassPhrase = async (secretPassphrase) => {
    let {publicKey, privateKey} = await cryptoUtil.getPublicPrivateKey(secretPassphrase);

    return GMD.getAccountId(publicKey).then((data) => {
        data.secretPassphrase = secretPassphrase;
        data.privateKey = privateKey;
        return data;
    })
}

/**
 *
 * @param {*} rsAccount
 * @returns true if RS account checsum and format is checks out, false is invalid address. Actual check is done remotely on a Coop Network Node, so lack of connectivity will result in error thrown.
 */
GMD.checkRSAddress = async (rsAccount) => {
    return GMD.apiCall('get', { requestType: 'rsConvert', account: rsAccount }).then(data => {
        return 'accountLongId' in data;
    })
}

/**
 * Returns a promise that will resolve to a balanceNQT
 */
GMD.getBalance = async (rsAccount) => {
    return GMD.apiCall('get', { requestType: 'getBalance', account: rsAccount }).then(data => {
        return data.balanceNQT;
    })
}

/**
 * Sends GMD to another wallet. The implementation does 3 operations:
 * 1. Creates an unsigned transaction for sending GMD by calling appropriate API on the node.
 * 2. Waits for the transaction created on step 1 to be received from the node and signs it locally.
 * 3. Broadcasts to the GMD nodes the signed transaction.
 *
 * @param {String} recipient RS destination account ('GMD-...' format)
 * @param {String} amountNQT Amount to be transfered in NQT. 1 GMD = 100000000 NQT.
 * @param {String} passPhrase Secret passphrase, used for step 2, local signing.
 * @param {String} feeNQT Fee in NQT
 * @returns Promise that resolves to a JSON with broadcast restult.
 */
GMD.sendMoney = (recipient, amountNQT, passPhrase, feeNQT) => {
    return sendMoneyAPICall(true, recipient, amountNQT, passPhrase, feeNQT);
}

/**
 * Same as GMD.sendMoney(), but onyl step 1. This is usefull when the signing and broadcast is done on other device (e.g. mobile).
 * Sender is identified thorough its public key, not secret passphrase.
 * @param {String} recipient same as GMD.sendMoney()
 * @param {String} amountNQT same as GMD.sendMoney()
 * @param {String} senderPublicKey sender public key.
 * @param {String} feeNQT same as GMD.sendMoney()
 * @returns Promise that resolves to a transaction JSON. If signing on other device, create a QR code with the string found in
 * transaction.unsignedTransactionBytes property. This string may be signed on the other device with GMD.signTransaction() (assuming
 * the other device uses this SDK)
 */
GMD.createUnsignedSendMoneyTransaction = (recipient, amountNQT, senderPublicKey, feeNQT) => {
    return sendMoneyAPICall(false, recipient, amountNQT, senderPublicKey, feeNQT);
}

const sendMoneyAPICall = async (signIt, recipient, amountNQT, from, feeNQT) => {
    const params = {
        requestType: 'sendMoney',
        recipient,
        amountNQT,
        feeNQT,
        deadline: '1440'
    };

    if (signIt) {
        params.publicKey = await GMD.getPublicKey(from);
    } else {
        params.publicKey = from;
    }
    const transaction = await GMD.apiCall('post', params);
    if (signIt) {
        if (GMD.isTransaction(transaction) && !GMD.isSignedTransactionResponse(transaction) && from) {
            const signedTransaction = await GMD.signTransaction(transaction.unsignedTransactionBytes, from);
            return GMD.broadcastSignedTransaction(signedTransaction);
        }
    } else {
        return transaction;
    }
}

module.exports = GMD;

},{"./crypto-util":4,"./get-axios":1,"./key-encryption":9,"./lib/wallet":10,"./pass-gen":14}],7:[function(require,module,exports){
const GMD = require('./gmd-crypto')
const GMDEvents = {
    BLOCK_EVENTS: [
        'Block.BLOCK_GENERATED',
        'Block.BLOCK_POPPED',
        'Block.BLOCK_PUSHED'
    ],
    PEER_EVENTS: [
        'Peer.ADD_INBOUND',
        'Peer.ADDED_ACTIVE_PEER',
        'Peer.BLACKLIST',
        'Peer.CHANGED_ACTIVE_PEER',
        'Peer.DEACTIVATE',
        'Peer.NEW_PEER',
        'Peer.REMOVE',
        'Peer.REMOVE_INBOUND',
        'Peer.UNBLACKLIST'
    ],
    TRANSACTION_EVENTS: [
        'Transaction.ADDED_CONFIRMED_TRANSACTIONS',
        'Transaction.ADDED_UNCONFIRMED_TRANSACTIONS',
        'Transaction.REJECT_PHASED_TRANSACTION',
        'Transaction.RELEASE_PHASED_TRANSACTION',
        'Transaction.REMOVE_UNCONFIRMED_TRANSACTIONS'
    ]
};

GMDEvents.ALL_EVENTS = GMDEvents.BLOCK_EVENTS.concat(GMDEvents.PEER_EVENTS).concat(GMDEvents.TRANSACTION_EVENTS);

let eventListeners = [];

GMDEvents.registerEventListener = async (listener) => {

    let initialLen = eventListeners.length;
    let id = Math.floor(Math.random() * 10000000000000000);
    let count = eventListeners.push({ listener: listener, id: id });
    if (initialLen == 0 && count == 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        startListening(id);
    }
    console.log('add listener. new listeners array size: ' + eventListeners.length)
}

const startListening = (id) => {
    console.log('startListening');
    GMD.apiCall('post', { requestType: 'eventRegister', httpTimeout: 5000 }).then((res) => {
        console.log('start listening callback ' + JSON.stringify(res, null, 2));
        if (res && res.registered) {
            console.log('succesfully registered')
        } else {
            this.unRegisterEventListener(id);
        }
        eventWait();
    });
}

const eventWait = async () => {
    console.log('waiting for event...')
    while (eventListeners.length > 0) {
        GMD.apiCall('post', { requestType: 'eventWait' }).then((res) => {
            console.log("event wait response: " + JSON.stringify(res, null, 2));
            if (Object.prototype.hasOwnProperty.call(res, 'errorCode') && res.errorCode == 8) {
                console.log('No events registered');
                eventListeners.pop();
            }
        });
        await new Promise(resolve => setTimeout(resolve, 15000));
    }
    console.log('exit waiting for event loop')
}

GMDEvents.unRegisterEventListener = (id) => {
    let tempListeners = eventListeners.filter(el => el.id !== id);
    eventListeners = tempListeners;
    console.log('trying to remove listener. new listener size: ' + eventListeners.length)
}

module.exports = GMDEvents;
},{"./gmd-crypto":6}],8:[function(require,module,exports){
const GMD = require('./gmd-crypto');
const GMDEvents = require('./gmd-events');


module.exports = {
    GMD: GMD,
    GMDEvents: GMDEvents
}
},{"./gmd-crypto":6,"./gmd-events":7}],9:[function(require,module,exports){
(function (Buffer){(function (){
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
    return KeyEncryption.encryptBytes(cryptoUtil.hexToBytes(messageHex), password);
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

KeyEncryption.encryptBytes = async (bytes, password) => {
    let { iv, salt } = await generateIvAndSalt();
    let encryptionKey = await genEncryptionKeyFromPassword(password, salt, iterations);
    let encryptedByteArray = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, encryptionKey, new Uint8Array(bytes));
    let ciphertext = Buffer.from(encryptedByteArray).toString('hex');
    return { iv: cryptoUtil.Uint8ArrayToHex(iv), salt: cryptoUtil.Uint8ArrayToHex(salt), ciphertext: ciphertext };
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

KeyEncryption.decryptToBytes = async (ciphertext, password) => {
    let result = await decrypt(ciphertext,password);
    return Array.from(result);
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
}).call(this)}).call(this,require("buffer").Buffer)
},{"./crypto-util":4,"./get-crypto":2,"buffer":12}],10:[function(require,module,exports){


class Wallet {
    constructor(publicKey, privKey, accountRS) {
        console.log('==Wallet== constructor');
        this.publicKey = publicKey;
        this.privKey = privKey;
        this.accountRS = accountRS;
    }

    details(){
        console.log('details: '+this.publicKey);
    }
}

module.exports = Wallet;
},{}],11:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],12:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":11,"buffer":12,"ieee754":13}],13:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],14:[function(require,module,exports){

const words = ["like", "just", "love", "know", "never", "want", "time", "out", "there", "make", "look", "eye", "down", "only", "think", "heart", "back", "then", "into", "about", "more", "away", "still", "them", "take", "thing", "even", "through", "long", "always", "world", "too", "friend", "tell", "try", "hand", "thought", "over", "here", "other", "need", "smile", "again", "much", "cry", "been", "night", "ever", "little", "said", "end", "some", "those", "around", "mind", "people", "girl", "leave", "dream", "left", "turn", "myself", "give", "nothing", "really", "off", "before", "something", "find", "walk", "wish", "good", "once", "place", "ask", "stop", "keep", "watch", "seem", "everything", "wait", "got", "yet", "made", "remember", "start", "alone", "run", "hope", "maybe", "believe", "body", "hate", "after", "close", "talk", "stand", "own", "each", "hurt", "help", "home", "god", "soul", "new", "many", "two", "inside", "should", "true", "first", "fear", "mean", "better", "play", "another", "gone", "change", "use", "wonder", "someone", "hair", "cold", "open", "best", "any", "behind", "happen", "water", "dark", "laugh", "stay", "forever", "name", "work", "show", "sky", "break", "came", "deep", "door", "put", "black", "together", "upon", "happy", "such", "great", "white", "matter", "fill", "past", "please", "burn", "cause", "enough", "touch", "moment", "soon", "voice", "scream", "anything", "stare", "sound", "red", "everyone", "hide", "kiss", "truth", "death", "beautiful", "mine", "blood", "broken", "very", "pass", "next", "forget", "tree", "wrong", "air", "mother", "understand", "lip", "hit", "wall", "memory", "sleep", "free", "high", "realize", "school", "might", "skin", "sweet", "perfect", "blue", "kill", "breath", "dance", "against", "fly", "between", "grow", "strong", "under", "listen", "bring", "sometimes", "speak", "pull", "person", "become", "family", "begin", "ground", "real", "small", "father", "sure", "feet", "rest", "young", "finally", "land", "across", "today", "different", "guy", "line", "fire", "reason", "reach", "second", "slowly", "write", "eat", "smell", "mouth", "step", "learn", "three", "floor", "promise", "breathe", "darkness", "push", "earth", "guess", "save", "song", "above", "along", "both", "color", "house", "almost", "sorry", "anymore", "brother", "okay", "dear", "game", "fade", "already", "apart", "warm", "beauty", "heard", "notice", "question", "shine", "began", "piece", "whole", "shadow", "secret", "street", "within", "finger", "point", "morning", "whisper", "child", "moon", "green", "story", "glass", "kid", "silence", "since", "soft", "yourself", "empty", "shall", "angel", "answer", "baby", "bright", "dad", "path", "worry", "hour", "drop", "follow", "power", "war", "half", "flow", "heaven", "act", "chance", "fact", "least", "tired", "children", "near", "quite", "afraid", "rise", "sea", "taste", "window", "cover", "nice", "trust", "lot", "sad", "cool", "force", "peace", "return", "blind", "easy", "ready", "roll", "rose", "drive", "held", "music", "beneath", "hang", "mom", "paint", "emotion", "quiet", "clear", "cloud", "few", "pretty", "bird", "outside", "paper", "picture", "front", "rock", "simple", "anyone", "meant", "reality", "road", "sense", "waste", "bit", "leaf", "thank", "happiness", "meet", "men", "smoke", "truly", "decide", "self", "age", "book", "form", "alive", "carry", "escape", "damn", "instead", "able", "ice", "minute", "throw", "catch", "leg", "ring", "course", "goodbye", "lead", "poem", "sick", "corner", "desire", "known", "problem", "remind", "shoulder", "suppose", "toward", "wave", "drink", "jump", "woman", "pretend", "sister", "week", "human", "joy", "crack", "grey", "pray", "surprise", "dry", "knee", "less", "search", "bleed", "caught", "clean", "embrace", "future", "king", "son", "sorrow", "chest", "hug", "remain", "sat", "worth", "blow", "daddy", "final", "parent", "tight", "also", "create", "lonely", "safe", "cross", "dress", "evil", "silent", "bone", "fate", "perhaps", "anger", "class", "scar", "snow", "tiny", "tonight", "continue", "control", "dog", "edge", "mirror", "month", "suddenly", "comfort", "given", "loud", "quickly", "gaze", "plan", "rush", "stone", "town", "battle", "ignore", "spirit", "stood", "stupid", "yours", "brown", "build", "dust", "hey", "kept", "pay", "phone", "twist", "although", "ball", "beyond", "hidden", "nose", "taken", "fail", "float", "pure", "somehow", "wash", "wrap", "angry", "cheek", "creature", "forgotten", "heat", "rip", "single", "space", "special", "weak", "whatever", "yell", "anyway", "blame", "job", "choose", "country", "curse", "drift", "echo", "figure", "grew", "laughter", "neck", "suffer", "worse", "yeah", "disappear", "foot", "forward", "knife", "mess", "somewhere", "stomach", "storm", "beg", "idea", "lift", "offer", "breeze", "field", "five", "often", "simply", "stuck", "win", "allow", "confuse", "enjoy", "except", "flower", "seek", "strength", "calm", "grin", "gun", "heavy", "hill", "large", "ocean", "shoe", "sigh", "straight", "summer", "tongue", "accept", "crazy", "everyday", "exist", "grass", "mistake", "sent", "shut", "surround", "table", "ache", "brain", "destroy", "heal", "nature", "shout", "sign", "stain", "choice", "doubt", "glance", "glow", "mountain", "queen", "stranger", "throat", "tomorrow", "city", "either", "fish", "flame", "rather", "shape", "spin", "spread", "ash", "distance", "finish", "image", "imagine", "important", "nobody", "shatter", "warmth", "became", "feed", "flesh", "funny", "lust", "shirt", "trouble", "yellow", "attention", "bare", "bite", "money", "protect", "amaze", "appear", "born", "choke", "completely", "daughter", "fresh", "friendship", "gentle", "probably", "six", "deserve", "expect", "grab", "middle", "nightmare", "river", "thousand", "weight", "worst", "wound", "barely", "bottle", "cream", "regret", "relationship", "stick", "test", "crush", "endless", "fault", "itself", "rule", "spill", "art", "circle", "join", "kick", "mask", "master", "passion", "quick", "raise", "smooth", "unless", "wander", "actually", "broke", "chair", "deal", "favorite", "gift", "note", "number", "sweat", "box", "chill", "clothes", "lady", "mark", "park", "poor", "sadness", "tie", "animal", "belong", "brush", "consume", "dawn", "forest", "innocent", "pen", "pride", "stream", "thick", "clay", "complete", "count", "draw", "faith", "press", "silver", "struggle", "surface", "taught", "teach", "wet", "bless", "chase", "climb", "enter", "letter", "melt", "metal", "movie", "stretch", "swing", "vision", "wife", "beside", "crash", "forgot", "guide", "haunt", "joke", "knock", "plant", "pour", "prove", "reveal", "steal", "stuff", "trip", "wood", "wrist", "bother", "bottom", "crawl", "crowd", "fix", "forgive", "frown", "grace", "loose", "lucky", "party", "release", "surely", "survive", "teacher", "gently", "grip", "speed", "suicide", "travel", "treat", "vein", "written", "cage", "chain", "conversation", "date", "enemy", "however", "interest", "million", "page", "pink", "proud", "sway", "themselves", "winter", "church", "cruel", "cup", "demon", "experience", "freedom", "pair", "pop", "purpose", "respect", "shoot", "softly", "state", "strange", "bar", "birth", "curl", "dirt", "excuse", "lord", "lovely", "monster", "order", "pack", "pants", "pool", "scene", "seven", "shame", "slide", "ugly", "among", "blade", "blonde", "closet", "creek", "deny", "drug", "eternity", "gain", "grade", "handle", "key", "linger", "pale", "prepare", "swallow", "swim", "tremble", "wheel", "won", "cast", "cigarette", "claim", "college", "direction", "dirty", "gather", "ghost", "hundred", "loss", "lung", "orange", "present", "swear", "swirl", "twice", "wild", "bitter", "blanket", "doctor", "everywhere", "flash", "grown", "knowledge", "numb", "pressure", "radio", "repeat", "ruin", "spend", "unknown", "buy", "clock", "devil", "early", "false", "fantasy", "pound", "precious", "refuse", "sheet", "teeth", "welcome", "add", "ahead", "block", "bury", "caress", "content", "depth", "despite", "distant", "marry", "purple", "threw", "whenever", "bomb", "dull", "easily", "grasp", "hospital", "innocence", "normal", "receive", "reply", "rhyme", "shade", "someday", "sword", "toe", "visit", "asleep", "bought", "center", "consider", "flat", "hero", "history", "ink", "insane", "muscle", "mystery", "pocket", "reflection", "shove", "silently", "smart", "soldier", "spot", "stress", "train", "type", "view", "whether", "bus", "energy", "explain", "holy", "hunger", "inch", "magic", "mix", "noise", "nowhere", "prayer", "presence", "shock", "snap", "spider", "study", "thunder", "trail", "admit", "agree", "bag", "bang", "bound", "butterfly", "cute", "exactly", "explode", "familiar", "fold", "further", "pierce", "reflect", "scent", "selfish", "sharp", "sink", "spring", "stumble", "universe", "weep", "women", "wonderful", "action", "ancient", "attempt", "avoid", "birthday", "branch", "chocolate", "core", "depress", "drunk", "especially", "focus", "fruit", "honest", "match", "palm", "perfectly", "pillow", "pity", "poison", "roar", "shift", "slightly", "thump", "truck", "tune", "twenty", "unable", "wipe", "wrote", "coat", "constant", "dinner", "drove", "egg", "eternal", "flight", "flood", "frame", "freak", "gasp", "glad", "hollow", "motion", "peer", "plastic", "root", "screen", "season", "sting", "strike", "team", "unlike", "victim", "volume", "warn", "weird", "attack", "await", "awake", "built", "charm", "crave", "despair", "fought", "grant", "grief", "horse", "limit", "message", "ripple", "sanity", "scatter", "serve", "split", "string", "trick", "annoy", "blur", "boat", "brave", "clearly", "cling", "connect", "fist", "forth", "imagination", "iron", "jock", "judge", "lesson", "milk", "misery", "nail", "naked", "ourselves", "poet", "possible", "princess", "sail", "size", "snake", "society", "stroke", "torture", "toss", "trace", "wise", "bloom", "bullet", "cell", "check", "cost", "darling", "during", "footstep", "fragile", "hallway", "hardly", "horizon", "invisible", "journey", "midnight", "mud", "nod", "pause", "relax", "shiver", "sudden", "value", "youth", "abuse", "admire", "blink", "breast", "bruise", "constantly", "couple", "creep", "curve", "difference", "dumb", "emptiness", "gotta", "honor", "plain", "planet", "recall", "rub", "ship", "slam", "soar", "somebody", "tightly", "weather", "adore", "approach", "bond", "bread", "burst", "candle", "coffee", "cousin", "crime", "desert", "flutter", "frozen", "grand", "heel", "hello", "language", "level", "movement", "pleasure", "powerful", "random", "rhythm", "settle", "silly", "slap", "sort", "spoken", "steel", "threaten", "tumble", "upset", "aside", "awkward", "bee", "blank", "board", "button", "card", "carefully", "complain", "crap", "deeply", "discover", "drag", "dread", "effort", "entire", "fairy", "giant", "gotten", "greet", "illusion", "jeans", "leap", "liquid", "march", "mend", "nervous", "nine", "replace", "rope", "spine", "stole", "terror", "accident", "apple", "balance", "boom", "childhood", "collect", "demand", "depression", "eventually", "faint", "glare", "goal", "group", "honey", "kitchen", "laid", "limb", "machine", "mere", "mold", "murder", "nerve", "painful", "poetry", "prince", "rabbit", "shelter", "shore", "shower", "soothe", "stair", "steady", "sunlight", "tangle", "tease", "treasure", "uncle", "begun", "bliss", "canvas", "cheer", "claw", "clutch", "commit", "crimson", "crystal", "delight", "doll", "existence", "express", "fog", "football", "gay", "goose", "guard", "hatred", "illuminate", "mass", "math", "mourn", "rich", "rough", "skip", "stir", "student", "style", "support", "thorn", "tough", "yard", "yearn", "yesterday", "advice", "appreciate", "autumn", "bank", "beam", "bowl", "capture", "carve", "collapse", "confusion", "creation", "dove", "feather", "girlfriend", "glory", "government", "harsh", "hop", "inner", "loser", "moonlight", "neighbor", "neither", "peach", "pig", "praise", "screw", "shield", "shimmer", "sneak", "stab", "subject", "throughout", "thrown", "tower", "twirl", "wow", "army", "arrive", "bathroom", "bump", "cease", "cookie", "couch", "courage", "dim", "guilt", "howl", "hum", "husband", "insult", "led", "lunch", "mock", "mostly", "natural", "nearly", "needle", "nerd", "peaceful", "perfection", "pile", "price", "remove", "roam", "sanctuary", "serious", "shiny", "shook", "sob", "stolen", "tap", "vain", "void", "warrior", "wrinkle", "affection", "apologize", "blossom", "bounce", "bridge", "cheap", "crumble", "decision", "descend", "desperately", "dig", "dot", "flip", "frighten", "heartbeat", "huge", "lazy", "lick", "odd", "opinion", "process", "puzzle", "quietly", "retreat", "score", "sentence", "separate", "situation", "skill", "soak", "square", "stray", "taint", "task", "tide", "underneath", "veil", "whistle", "anywhere", "bedroom", "bid", "bloody", "burden", "careful", "compare", "concern", "curtain", "decay", "defeat", "describe", "double", "dreamer", "driver", "dwell", "evening", "flare", "flicker", "grandma", "guitar", "harm", "horrible", "hungry", "indeed", "lace", "melody", "monkey", "nation", "object", "obviously", "rainbow", "salt", "scratch", "shown", "shy", "stage", "stun", "third", "tickle", "useless", "weakness", "worship", "worthless", "afternoon", "beard", "boyfriend", "bubble", "busy", "certain", "chin", "concrete", "desk", "diamond", "doom", "drawn", "due", "felicity", "freeze", "frost", "garden", "glide", "harmony", "hopefully", "hunt", "jealous", "lightning", "mama", "mercy", "peel", "physical", "position", "pulse", "punch", "quit", "rant", "respond", "salty", "sane", "satisfy", "savior", "sheep", "slept", "social", "sport", "tuck", "utter", "valley", "wolf", "aim", "alas", "alter", "arrow", "awaken", "beaten", "belief", "brand", "ceiling", "cheese", "clue", "confidence", "connection", "daily", "disguise", "eager", "erase", "essence", "everytime", "expression", "fan", "flag", "flirt", "foul", "fur", "giggle", "glorious", "ignorance", "law", "lifeless", "measure", "mighty", "muse", "north", "opposite", "paradise", "patience", "patient", "pencil", "petal", "plate", "ponder", "possibly", "practice", "slice", "spell", "stock", "strife", "strip", "suffocate", "suit", "tender", "tool", "trade", "velvet", "verse", "waist", "witch", "aunt", "bench", "bold", "cap", "certainly", "click", "companion", "creator", "dart", "delicate", "determine", "dish", "dragon", "drama", "drum", "dude", "everybody", "feast", "forehead", "former", "fright", "fully", "gas", "hook", "hurl", "invite", "juice", "manage", "moral", "possess", "raw", "rebel", "royal", "scale", "scary", "several", "slight", "stubborn", "swell", "talent", "tea", "terrible", "thread", "torment", "trickle", "usually", "vast", "violence", "weave", "acid", "agony", "ashamed", "awe", "belly", "blend", "blush", "character", "cheat", "common", "company", "coward", "creak", "danger", "deadly", "defense", "define", "depend", "desperate", "destination", "dew", "duck", "dusty", "embarrass", "engine", "example", "explore", "foe", "freely", "frustrate", "generation", "glove", "guilty", "health", "hurry", "idiot", "impossible", "inhale", "jaw", "kingdom", "mention", "mist", "moan", "mumble", "mutter", "observe", "ode", "pathetic", "pattern", "pie", "prefer", "puff", "rape", "rare", "revenge", "rude", "scrape", "spiral", "squeeze", "strain", "sunset", "suspend", "sympathy", "thigh", "throne", "total", "unseen", "weapon", "weary"];

const PassPhraseGenerator = {}

PassPhraseGenerator.generatePass = (numberOfWords) => {
    const crypto = require('./get-crypto');
    if (!numberOfWords) {
        numberOfWords = 12;
    }
    //console.log("generating pass ");
    const rndArray = new Uint32Array(numberOfWords);
    crypto.getRandomValues(rndArray);
    let passPhrase = [];
    for (let i in rndArray) {
        passPhrase.push(words[rndArray[i] % words.length]);
    }
    crypto.getRandomValues(rndArray);
    return passPhrase.join(" ");
};

module.exports = PassPhraseGenerator;

},{"./get-crypto":2}]},{},[3]);
