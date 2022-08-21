(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* eslint-disable no-undef */
module.exports = axios;
},{}],2:[function(require,module,exports){
module.exports = window.crypto;
},{}],3:[function(require,module,exports){

window.GMD = {
    Wallet: require('../dist/wallet'),
    Provider: require('../dist/provider')
}

},{"../dist/provider":9,"../dist/wallet":13}],4:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtil = void 0;
var get_crypto_1 = __importDefault(require("./get-crypto"));
var curve25519_1 = require("./curve25519");
var rs_address_1 = require("./rs-address");
var CryptoUtil;
(function (CryptoUtil) {
    var Converters;
    (function (Converters) {
        function strToHex(str) {
            var result = '';
            strToBytes(str).forEach(function (c) { return result += c.toString(16); });
            return result;
        }
        Converters.strToHex = strToHex;
        function strToBytes(str) {
            var result = [];
            for (var i = 0; i < str.length; i++) {
                result.push(str.charCodeAt(i));
            }
            return result;
        }
        Converters.strToBytes = strToBytes;
        function hexToString(hex) {
            var string = '';
            for (var i = 0; i < hex.length; i += 2) {
                string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            return string;
        }
        Converters.hexToString = hexToString;
        function hexToBytes(hex) {
            var bytes = [];
            for (var c = 0; c < hex.length; c += 2) {
                bytes.push(parseInt(hex.substr(c, 2), 16));
            }
            return bytes;
        }
        Converters.hexToBytes = hexToBytes;
        function bytesToHex(byteArray) {
            return Array.from(byteArray, function (byte) {
                return ('0' + (byte & 0xFF).toString(16)).slice(-2);
            }).join('');
        }
        Converters.bytesToHex = bytesToHex;
        function strToUint8(str) {
            return new Uint8Array(strToBytes(str));
        }
        Converters.strToUint8 = strToUint8;
        function hexToUint8(hex) {
            return new Uint8Array(hexToBytes(hex));
        }
        Converters.hexToUint8 = hexToUint8;
        function Uint8ArrayToStr(buffer) {
            var s = '';
            for (var i = 0; i < buffer.length; i++) {
                s += String.fromCharCode(buffer[i]);
            }
            return s;
        }
        Converters.Uint8ArrayToStr = Uint8ArrayToStr;
        function Uint8ArrayToHex(buffer) {
            return bytesToHex(Array.from(buffer));
        }
        Converters.Uint8ArrayToHex = Uint8ArrayToHex;
        function bytesToString(bytesArray) {
            return String.fromCharCode.apply(null, bytesArray);
        }
        Converters.bytesToString = bytesToString;
        function hexToDec(hex) {
            if (hex.length % 2) {
                hex = '0' + hex;
            }
            return BigInt('0x' + hex).toString(10);
        }
        Converters.hexToDec = hexToDec;
        function byteArraysEqual(bytes1, bytes2) {
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
        Converters.byteArraysEqual = byteArraysEqual;
        function isHex(str) {
            var re = /^[0-9a-fA-F]+$/;
            return str != null && str.length > 0 && re.test(str);
        }
        Converters.isHex = isHex;
    })(Converters = CryptoUtil.Converters || (CryptoUtil.Converters = {}));
    var Crypto;
    (function (Crypto) {
        function SHA256(in1, in2) {
            return __awaiter(this, void 0, void 0, function () {
                var input, arrayBufferInput, output;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            input = [];
                            if (in1) {
                                if (in2) {
                                    input = in1.concat(in2);
                                }
                                else {
                                    input = in1;
                                }
                            }
                            else {
                                if (in2) {
                                    input = in2;
                                }
                            }
                            arrayBufferInput = Uint8Array.from(input);
                            return [4 /*yield*/, get_crypto_1.default.subtle.digest('SHA-256', arrayBufferInput)];
                        case 1:
                            output = _a.sent();
                            return [2 /*return*/, Array.from(new Uint8Array(output))];
                    }
                });
            });
        }
        Crypto.SHA256 = SHA256;
        function signBytes(message, passPhrase) {
            return __awaiter(this, void 0, void 0, function () {
                var privateKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getPrivateKey(passPhrase)];
                        case 1:
                            privateKey = _a.sent();
                            return [2 /*return*/, signHex(message, privateKey)];
                    }
                });
            });
        }
        Crypto.signBytes = signBytes;
        function signHex(message, privateKey) {
            return __awaiter(this, void 0, void 0, function () {
                var messageBytes, s, m, x, y, h, v;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            messageBytes = Converters.hexToBytes(message);
                            s = Converters.hexToBytes(privateKey);
                            return [4 /*yield*/, SHA256(messageBytes)];
                        case 1:
                            m = _a.sent();
                            return [4 /*yield*/, SHA256(m, s)];
                        case 2:
                            x = _a.sent();
                            y = curve25519_1.curve25519.keygen(x).p;
                            return [4 /*yield*/, SHA256(m, y)];
                        case 3:
                            h = _a.sent();
                            v = curve25519_1.curve25519.sign(h, x, s);
                            return [2 /*return*/, Converters.bytesToHex(v ? v.concat(h) : [])];
                    }
                });
            });
        }
        Crypto.signHex = signHex;
        function getPrivateKey(pass) {
            return __awaiter(this, void 0, void 0, function () {
                var privateKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getWalletDetails(pass)];
                        case 1:
                            privateKey = (_a.sent()).privateKey;
                            return [2 /*return*/, privateKey];
                    }
                });
            });
        }
        Crypto.getPrivateKey = getPrivateKey;
        function getPublicKey(pass) {
            return __awaiter(this, void 0, void 0, function () {
                var publicKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getWalletDetails(pass)];
                        case 1:
                            publicKey = (_a.sent()).publicKey;
                            return [2 /*return*/, publicKey];
                    }
                });
            });
        }
        Crypto.getPublicKey = getPublicKey;
        function getWalletDetails(passPhrase) {
            return __awaiter(this, void 0, void 0, function () {
                var seed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getSeed(passPhrase)];
                        case 1:
                            seed = _a.sent();
                            return [2 /*return*/, getWalletDetailsFromSeed(seed)];
                    }
                });
            });
        }
        Crypto.getWalletDetails = getWalletDetails;
        function getSeed(passPhrase) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, SHA256(Converters.strToBytes(passPhrase))];
                });
            });
        }
        Crypto.getSeed = getSeed;
        function getWalletDetailsFromSeed(seed) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, p, s, publicKey, privateKey, accountId;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = curve25519_1.curve25519.keygen(seed), p = _a.p, s = _a.s;
                            publicKey = Converters.bytesToHex(p);
                            privateKey = Converters.bytesToHex(s);
                            return [4 /*yield*/, publicKeyToAccountId(publicKey)];
                        case 1:
                            accountId = _b.sent();
                            return [2 /*return*/, { publicKey: publicKey, privateKey: privateKey, accountId: accountId }];
                    }
                });
            });
        }
        Crypto.getWalletDetailsFromSeed = getWalletDetailsFromSeed;
        function publicKeyToAccountId(publicKeyHex) {
            return __awaiter(this, void 0, void 0, function () {
                var sha256digest, accountIdBytes, accountId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, SHA256(Converters.hexToBytes(publicKeyHex))];
                        case 1:
                            sha256digest = _a.sent();
                            accountIdBytes = sha256digest.slice(0, 8).reverse();
                            accountId = Converters.hexToDec(Converters.bytesToHex(accountIdBytes));
                            return [2 /*return*/, accountId];
                    }
                });
            });
        }
        Crypto.publicKeyToAccountId = publicKeyToAccountId;
        function verifySignature(signature, unsignedMessage, publicKey) {
            return __awaiter(this, void 0, void 0, function () {
                var signatureBytes, messageBytes, publicKeyBytes, v, h, Y, m, h2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            signatureBytes = Converters.hexToBytes(signature);
                            messageBytes = Converters.hexToBytes(unsignedMessage);
                            publicKeyBytes = Converters.hexToBytes(publicKey);
                            v = signatureBytes.slice(0, 32);
                            h = signatureBytes.slice(32);
                            Y = curve25519_1.curve25519.verify(v, h, publicKeyBytes);
                            return [4 /*yield*/, SHA256(messageBytes)];
                        case 1:
                            m = _a.sent();
                            return [4 /*yield*/, SHA256(m, Y)];
                        case 2:
                            h2 = _a.sent();
                            return [2 /*return*/, Converters.byteArraysEqual(h, h2)];
                    }
                });
            });
        }
        Crypto.verifySignature = verifySignature;
        function publicKeyToRSAccount(publicKeyHex) {
            return __awaiter(this, void 0, void 0, function () {
                var accountId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, publicKeyToAccountId(publicKeyHex)];
                        case 1:
                            accountId = _a.sent();
                            return [2 /*return*/, accountIdToRS(accountId)];
                    }
                });
            });
        }
        Crypto.publicKeyToRSAccount = publicKeyToRSAccount;
        function accountIdToRS(accountId) {
            var rsaddr = new rs_address_1.RSAddress();
            rsaddr.set(accountId);
            return rsaddr.toString();
        }
        Crypto.accountIdToRS = accountIdToRS;
    })(Crypto = CryptoUtil.Crypto || (CryptoUtil.Crypto = {}));
})(CryptoUtil = exports.CryptoUtil || (exports.CryptoUtil = {}));

},{"./curve25519":5,"./get-crypto":2,"./rs-address":10}],5:[function(require,module,exports){
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.curve25519 = void 0;
exports.curve25519 = function () {
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
        return (((x[0] > P26 - 19)) &&
            ((x[1] & x[3] & x[5] & x[7] & x[9]) === P25) &&
            ((x[2] & x[4] & x[6] & x[8]) === P26)) || (x[9] > P25);
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
        }
        else {
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
        var y = c255lmul8h(a[15] + a[7], a[14] + a[6], a[13] + a[5], a[12] + a[4], a[11] + a[3], a[10] + a[2], a[9] + a[1], a[8] + a[0], b[15] + b[7], b[14] + b[6], b[13] + b[5], b[12] + b[4], b[11] + b[3], b[10] + b[2], b[9] + b[1], b[8] + b[0]);
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
            if (is_negative(t1) !== 0) /* sign is 1, so just copy  */
                cpy32(s, k);
            else /* sign is -1, so negate  */
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
        var h1 = new Array(32);
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
                mont_add(t1[1], t2[1], t1[k], t2[k], yx[1], yz[1], p[di >> j & 1]);
                mont_add(t1[2], t2[2], t1[0], t2[0], yx[2], yz[2], s[((vi ^ hi) >> j & 2) >> 1]);
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
//module.exports = curve25519;

},{}],6:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteAPICaller = void 0;
var get_axios_1 = __importDefault(require("./get-axios"));
var RemoteAPICaller = /** @class */ (function () {
    function RemoteAPICaller(baseURL) {
        this.baseURL = baseURL;
        this.log = null;
    }
    RemoteAPICaller.prototype.setLogger = function (logger) {
        this.log = logger;
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
    RemoteAPICaller.prototype.apiCall = function (method, params) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            var _this = this;
            return __generator(this, function (_a) {
                config = { method: method, url: this.baseURL + 'nxt?' + (new URLSearchParams(params)).toString(), httpTimeout: "" };
                return [2 /*return*/, (0, get_axios_1.default)(config).then(function (res) {
                        if (_this.log)
                            _this.log("Response status on request to ".concat(config.url, " is ").concat(res.status, "\nresponse body:\n").concat(JSON.stringify(res.data, null, 2)));
                        return res.data;
                    })];
            });
        });
    };
    return RemoteAPICaller;
}());
exports.RemoteAPICaller = RemoteAPICaller;

},{"./get-axios":1}],7:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyEncryption = void 0;
var crypto_util_1 = require("./crypto-util");
var Converters = crypto_util_1.CryptoUtil.Converters;
var get_crypto_1 = __importDefault(require("./get-crypto"));
var iterations = 223978;
exports.KeyEncryption = {
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
    encryptHex: function (messageHex, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (messageHex && messageHex.length % 2) {
                    throw new Error('Hex string to be encrypted cannot have a 0 length or have an even number of hex digits');
                }
                return [2 /*return*/, this.encryptBytes(Converters.hexToBytes(messageHex), password)];
            });
        });
    },
    /**
     * Same as  KeyEncryption.encryptHex() but it encrypts any string,
     * @param {*} message any string to be encrypted.
     * @param {*} password same as KeyEncryption.encryptHex()
     * @returns a promise that resolves to an encrypted JSON. JSON contains: iv, salt, ciphertext.
     */
    encryptStr: function (message, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.encryptHex(Converters.strToHex(message), password)];
            });
        });
    },
    encryptBytes: function (bytes, password) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, iv, salt, encryptionKey, encryptedByteArray, ciphertext;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.generateIvAndSalt()];
                    case 1:
                        _a = _b.sent(), iv = _a.iv, salt = _a.salt;
                        return [4 /*yield*/, this.genEncryptionKeyFromPassword(password, salt, iterations)];
                    case 2:
                        encryptionKey = _b.sent();
                        return [4 /*yield*/, get_crypto_1.default.subtle.encrypt({ name: "AES-GCM", iv: iv }, encryptionKey, new Uint8Array(bytes))];
                    case 3:
                        encryptedByteArray = _b.sent();
                        ciphertext = Converters.Uint8ArrayToHex(new Uint8Array(encryptedByteArray));
                        return [2 /*return*/, { iv: Converters.Uint8ArrayToHex(iv), salt: Converters.Uint8ArrayToHex(salt), ciphertext: ciphertext }];
                }
            });
        });
    },
    /**
     * Helper function used to decrypt to hex. Used in pair with KeyEncryption.encryptHex() most common use case is to encrypt/decrypt private key.
     *
     * @param {*} encryptedJSON
     * @param {*} password
     * @returns a promise that resolves to the unencrypted hex string.
     */
    decryptToHex: function (encryptedJSON, password) {
        return __awaiter(this, void 0, void 0, function () {
            var decryptedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.decrypt(encryptedJSON, password)];
                    case 1:
                        decryptedData = _a.sent();
                        return [2 /*return*/, Converters.Uint8ArrayToHex(decryptedData)];
                }
            });
        });
    },
    /**
     * Decrypt to a string.  Used in pair with KeyEncryption.encryptStr().
     *
     * @param {*} encryptedJSON
     * @param {*} password
     * @returns a promise that resolves to the unencrypted plain text UTF-16 encoded.
     */
    decryptToStr: function (encryptedJSON, password) {
        return __awaiter(this, void 0, void 0, function () {
            var decryptedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.decrypt(encryptedJSON, password)];
                    case 1:
                        decryptedData = _a.sent();
                        return [2 /*return*/, Converters.Uint8ArrayToStr(decryptedData)];
                }
            });
        });
    },
    decryptToBytes: function (encryptedJSON, password) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.decrypt(encryptedJSON, password)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, Array.from(result)];
                }
            });
        });
    },
    decrypt: function (encryptedJSON, password) {
        return __awaiter(this, void 0, void 0, function () {
            var ciphertext, iv, salt, encryptionKey, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(encryptedJSON && 'iv' in encryptedJSON && 'salt' in encryptedJSON && 'ciphertext' in encryptedJSON)) return [3 /*break*/, 3];
                        ciphertext = Converters.hexToUint8(encryptedJSON.ciphertext);
                        iv = Converters.hexToUint8(encryptedJSON.iv);
                        salt = Converters.hexToUint8(encryptedJSON.salt);
                        return [4 /*yield*/, this.genEncryptionKeyFromPassword(password, salt, iterations)];
                    case 1:
                        encryptionKey = _a.sent();
                        return [4 /*yield*/, get_crypto_1.default.subtle.decrypt({ name: "AES-GCM", iv: iv }, encryptionKey, ciphertext)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, new Uint8Array(result)];
                    case 3: throw new Error('Encrypted JSON not correct');
                }
            });
        });
    },
    generateIvAndSalt: function () {
        return __awaiter(this, void 0, void 0, function () {
            var iv, salt;
            return __generator(this, function (_a) {
                iv = get_crypto_1.default.getRandomValues(new Uint8Array(16));
                salt = get_crypto_1.default.getRandomValues(new Uint8Array(16));
                return [2 /*return*/, { iv: iv, salt: salt }];
            });
        });
    },
    genEncryptionKeyFromPassword: function (password, salt, iterations) {
        return __awaiter(this, void 0, void 0, function () {
            var importedPassword;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, get_crypto_1.default.subtle.importKey("raw", Converters.strToUint8(password), { "name": "PBKDF2" }, false, ["deriveKey"])];
                    case 1:
                        importedPassword = _a.sent();
                        return [2 /*return*/, get_crypto_1.default.subtle.deriveKey({
                                "name": "PBKDF2",
                                "salt": salt,
                                "iterations": iterations,
                                "hash": "SHA-256"
                            }, importedPassword, {
                                "name": "AES-GCM",
                                "length": 128
                            }, false, ["encrypt", "decrypt"])];
                }
            });
        });
    }
};
exports.default = exports.KeyEncryption;

},{"./crypto-util":4,"./get-crypto":2}],8:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var words = ["like", "just", "love", "know", "never", "want", "time", "out", "there", "make", "look", "eye", "down", "only", "think", "heart", "back", "then", "into", "about", "more", "away", "still", "them", "take", "thing", "even", "through", "long", "always", "world", "too", "friend", "tell", "try", "hand", "thought", "over", "here", "other", "need", "smile", "again", "much", "cry", "been", "night", "ever", "little", "said", "end", "some", "those", "around", "mind", "people", "girl", "leave", "dream", "left", "turn", "myself", "give", "nothing", "really", "off", "before", "something", "find", "walk", "wish", "good", "once", "place", "ask", "stop", "keep", "watch", "seem", "everything", "wait", "got", "yet", "made", "remember", "start", "alone", "run", "hope", "maybe", "believe", "body", "hate", "after", "close", "talk", "stand", "own", "each", "hurt", "help", "home", "god", "soul", "new", "many", "two", "inside", "should", "true", "first", "fear", "mean", "better", "play", "another", "gone", "change", "use", "wonder", "someone", "hair", "cold", "open", "best", "any", "behind", "happen", "water", "dark", "laugh", "stay", "forever", "name", "work", "show", "sky", "break", "came", "deep", "door", "put", "black", "together", "upon", "happy", "such", "great", "white", "matter", "fill", "past", "please", "burn", "cause", "enough", "touch", "moment", "soon", "voice", "scream", "anything", "stare", "sound", "red", "everyone", "hide", "kiss", "truth", "death", "beautiful", "mine", "blood", "broken", "very", "pass", "next", "forget", "tree", "wrong", "air", "mother", "understand", "lip", "hit", "wall", "memory", "sleep", "free", "high", "realize", "school", "might", "skin", "sweet", "perfect", "blue", "kill", "breath", "dance", "against", "fly", "between", "grow", "strong", "under", "listen", "bring", "sometimes", "speak", "pull", "person", "become", "family", "begin", "ground", "real", "small", "father", "sure", "feet", "rest", "young", "finally", "land", "across", "today", "different", "guy", "line", "fire", "reason", "reach", "second", "slowly", "write", "eat", "smell", "mouth", "step", "learn", "three", "floor", "promise", "breathe", "darkness", "push", "earth", "guess", "save", "song", "above", "along", "both", "color", "house", "almost", "sorry", "anymore", "brother", "okay", "dear", "game", "fade", "already", "apart", "warm", "beauty", "heard", "notice", "question", "shine", "began", "piece", "whole", "shadow", "secret", "street", "within", "finger", "point", "morning", "whisper", "child", "moon", "green", "story", "glass", "kid", "silence", "since", "soft", "yourself", "empty", "shall", "angel", "answer", "baby", "bright", "dad", "path", "worry", "hour", "drop", "follow", "power", "war", "half", "flow", "heaven", "act", "chance", "fact", "least", "tired", "children", "near", "quite", "afraid", "rise", "sea", "taste", "window", "cover", "nice", "trust", "lot", "sad", "cool", "force", "peace", "return", "blind", "easy", "ready", "roll", "rose", "drive", "held", "music", "beneath", "hang", "mom", "paint", "emotion", "quiet", "clear", "cloud", "few", "pretty", "bird", "outside", "paper", "picture", "front", "rock", "simple", "anyone", "meant", "reality", "road", "sense", "waste", "bit", "leaf", "thank", "happiness", "meet", "men", "smoke", "truly", "decide", "self", "age", "book", "form", "alive", "carry", "escape", "damn", "instead", "able", "ice", "minute", "throw", "catch", "leg", "ring", "course", "goodbye", "lead", "poem", "sick", "corner", "desire", "known", "problem", "remind", "shoulder", "suppose", "toward", "wave", "drink", "jump", "woman", "pretend", "sister", "week", "human", "joy", "crack", "grey", "pray", "surprise", "dry", "knee", "less", "search", "bleed", "caught", "clean", "embrace", "future", "king", "son", "sorrow", "chest", "hug", "remain", "sat", "worth", "blow", "daddy", "final", "parent", "tight", "also", "create", "lonely", "safe", "cross", "dress", "evil", "silent", "bone", "fate", "perhaps", "anger", "class", "scar", "snow", "tiny", "tonight", "continue", "control", "dog", "edge", "mirror", "month", "suddenly", "comfort", "given", "loud", "quickly", "gaze", "plan", "rush", "stone", "town", "battle", "ignore", "spirit", "stood", "stupid", "yours", "brown", "build", "dust", "hey", "kept", "pay", "phone", "twist", "although", "ball", "beyond", "hidden", "nose", "taken", "fail", "float", "pure", "somehow", "wash", "wrap", "angry", "cheek", "creature", "forgotten", "heat", "rip", "single", "space", "special", "weak", "whatever", "yell", "anyway", "blame", "job", "choose", "country", "curse", "drift", "echo", "figure", "grew", "laughter", "neck", "suffer", "worse", "yeah", "disappear", "foot", "forward", "knife", "mess", "somewhere", "stomach", "storm", "beg", "idea", "lift", "offer", "breeze", "field", "five", "often", "simply", "stuck", "win", "allow", "confuse", "enjoy", "except", "flower", "seek", "strength", "calm", "grin", "gun", "heavy", "hill", "large", "ocean", "shoe", "sigh", "straight", "summer", "tongue", "accept", "crazy", "everyday", "exist", "grass", "mistake", "sent", "shut", "surround", "table", "ache", "brain", "destroy", "heal", "nature", "shout", "sign", "stain", "choice", "doubt", "glance", "glow", "mountain", "queen", "stranger", "throat", "tomorrow", "city", "either", "fish", "flame", "rather", "shape", "spin", "spread", "ash", "distance", "finish", "image", "imagine", "important", "nobody", "shatter", "warmth", "became", "feed", "flesh", "funny", "lust", "shirt", "trouble", "yellow", "attention", "bare", "bite", "money", "protect", "amaze", "appear", "born", "choke", "completely", "daughter", "fresh", "friendship", "gentle", "probably", "six", "deserve", "expect", "grab", "middle", "nightmare", "river", "thousand", "weight", "worst", "wound", "barely", "bottle", "cream", "regret", "relationship", "stick", "test", "crush", "endless", "fault", "itself", "rule", "spill", "art", "circle", "join", "kick", "mask", "master", "passion", "quick", "raise", "smooth", "unless", "wander", "actually", "broke", "chair", "deal", "favorite", "gift", "note", "number", "sweat", "box", "chill", "clothes", "lady", "mark", "park", "poor", "sadness", "tie", "animal", "belong", "brush", "consume", "dawn", "forest", "innocent", "pen", "pride", "stream", "thick", "clay", "complete", "count", "draw", "faith", "press", "silver", "struggle", "surface", "taught", "teach", "wet", "bless", "chase", "climb", "enter", "letter", "melt", "metal", "movie", "stretch", "swing", "vision", "wife", "beside", "crash", "forgot", "guide", "haunt", "joke", "knock", "plant", "pour", "prove", "reveal", "steal", "stuff", "trip", "wood", "wrist", "bother", "bottom", "crawl", "crowd", "fix", "forgive", "frown", "grace", "loose", "lucky", "party", "release", "surely", "survive", "teacher", "gently", "grip", "speed", "suicide", "travel", "treat", "vein", "written", "cage", "chain", "conversation", "date", "enemy", "however", "interest", "million", "page", "pink", "proud", "sway", "themselves", "winter", "church", "cruel", "cup", "demon", "experience", "freedom", "pair", "pop", "purpose", "respect", "shoot", "softly", "state", "strange", "bar", "birth", "curl", "dirt", "excuse", "lord", "lovely", "monster", "order", "pack", "pants", "pool", "scene", "seven", "shame", "slide", "ugly", "among", "blade", "blonde", "closet", "creek", "deny", "drug", "eternity", "gain", "grade", "handle", "key", "linger", "pale", "prepare", "swallow", "swim", "tremble", "wheel", "won", "cast", "cigarette", "claim", "college", "direction", "dirty", "gather", "ghost", "hundred", "loss", "lung", "orange", "present", "swear", "swirl", "twice", "wild", "bitter", "blanket", "doctor", "everywhere", "flash", "grown", "knowledge", "numb", "pressure", "radio", "repeat", "ruin", "spend", "unknown", "buy", "clock", "devil", "early", "false", "fantasy", "pound", "precious", "refuse", "sheet", "teeth", "welcome", "add", "ahead", "block", "bury", "caress", "content", "depth", "despite", "distant", "marry", "purple", "threw", "whenever", "bomb", "dull", "easily", "grasp", "hospital", "innocence", "normal", "receive", "reply", "rhyme", "shade", "someday", "sword", "toe", "visit", "asleep", "bought", "center", "consider", "flat", "hero", "history", "ink", "insane", "muscle", "mystery", "pocket", "reflection", "shove", "silently", "smart", "soldier", "spot", "stress", "train", "type", "view", "whether", "bus", "energy", "explain", "holy", "hunger", "inch", "magic", "mix", "noise", "nowhere", "prayer", "presence", "shock", "snap", "spider", "study", "thunder", "trail", "admit", "agree", "bag", "bang", "bound", "butterfly", "cute", "exactly", "explode", "familiar", "fold", "further", "pierce", "reflect", "scent", "selfish", "sharp", "sink", "spring", "stumble", "universe", "weep", "women", "wonderful", "action", "ancient", "attempt", "avoid", "birthday", "branch", "chocolate", "core", "depress", "drunk", "especially", "focus", "fruit", "honest", "match", "palm", "perfectly", "pillow", "pity", "poison", "roar", "shift", "slightly", "thump", "truck", "tune", "twenty", "unable", "wipe", "wrote", "coat", "constant", "dinner", "drove", "egg", "eternal", "flight", "flood", "frame", "freak", "gasp", "glad", "hollow", "motion", "peer", "plastic", "root", "screen", "season", "sting", "strike", "team", "unlike", "victim", "volume", "warn", "weird", "attack", "await", "awake", "built", "charm", "crave", "despair", "fought", "grant", "grief", "horse", "limit", "message", "ripple", "sanity", "scatter", "serve", "split", "string", "trick", "annoy", "blur", "boat", "brave", "clearly", "cling", "connect", "fist", "forth", "imagination", "iron", "jock", "judge", "lesson", "milk", "misery", "nail", "naked", "ourselves", "poet", "possible", "princess", "sail", "size", "snake", "society", "stroke", "torture", "toss", "trace", "wise", "bloom", "bullet", "cell", "check", "cost", "darling", "during", "footstep", "fragile", "hallway", "hardly", "horizon", "invisible", "journey", "midnight", "mud", "nod", "pause", "relax", "shiver", "sudden", "value", "youth", "abuse", "admire", "blink", "breast", "bruise", "constantly", "couple", "creep", "curve", "difference", "dumb", "emptiness", "gotta", "honor", "plain", "planet", "recall", "rub", "ship", "slam", "soar", "somebody", "tightly", "weather", "adore", "approach", "bond", "bread", "burst", "candle", "coffee", "cousin", "crime", "desert", "flutter", "frozen", "grand", "heel", "hello", "language", "level", "movement", "pleasure", "powerful", "random", "rhythm", "settle", "silly", "slap", "sort", "spoken", "steel", "threaten", "tumble", "upset", "aside", "awkward", "bee", "blank", "board", "button", "card", "carefully", "complain", "crap", "deeply", "discover", "drag", "dread", "effort", "entire", "fairy", "giant", "gotten", "greet", "illusion", "jeans", "leap", "liquid", "march", "mend", "nervous", "nine", "replace", "rope", "spine", "stole", "terror", "accident", "apple", "balance", "boom", "childhood", "collect", "demand", "depression", "eventually", "faint", "glare", "goal", "group", "honey", "kitchen", "laid", "limb", "machine", "mere", "mold", "murder", "nerve", "painful", "poetry", "prince", "rabbit", "shelter", "shore", "shower", "soothe", "stair", "steady", "sunlight", "tangle", "tease", "treasure", "uncle", "begun", "bliss", "canvas", "cheer", "claw", "clutch", "commit", "crimson", "crystal", "delight", "doll", "existence", "express", "fog", "football", "gay", "goose", "guard", "hatred", "illuminate", "mass", "math", "mourn", "rich", "rough", "skip", "stir", "student", "style", "support", "thorn", "tough", "yard", "yearn", "yesterday", "advice", "appreciate", "autumn", "bank", "beam", "bowl", "capture", "carve", "collapse", "confusion", "creation", "dove", "feather", "girlfriend", "glory", "government", "harsh", "hop", "inner", "loser", "moonlight", "neighbor", "neither", "peach", "pig", "praise", "screw", "shield", "shimmer", "sneak", "stab", "subject", "throughout", "thrown", "tower", "twirl", "wow", "army", "arrive", "bathroom", "bump", "cease", "cookie", "couch", "courage", "dim", "guilt", "howl", "hum", "husband", "insult", "led", "lunch", "mock", "mostly", "natural", "nearly", "needle", "nerd", "peaceful", "perfection", "pile", "price", "remove", "roam", "sanctuary", "serious", "shiny", "shook", "sob", "stolen", "tap", "vain", "void", "warrior", "wrinkle", "affection", "apologize", "blossom", "bounce", "bridge", "cheap", "crumble", "decision", "descend", "desperately", "dig", "dot", "flip", "frighten", "heartbeat", "huge", "lazy", "lick", "odd", "opinion", "process", "puzzle", "quietly", "retreat", "score", "sentence", "separate", "situation", "skill", "soak", "square", "stray", "taint", "task", "tide", "underneath", "veil", "whistle", "anywhere", "bedroom", "bid", "bloody", "burden", "careful", "compare", "concern", "curtain", "decay", "defeat", "describe", "double", "dreamer", "driver", "dwell", "evening", "flare", "flicker", "grandma", "guitar", "harm", "horrible", "hungry", "indeed", "lace", "melody", "monkey", "nation", "object", "obviously", "rainbow", "salt", "scratch", "shown", "shy", "stage", "stun", "third", "tickle", "useless", "weakness", "worship", "worthless", "afternoon", "beard", "boyfriend", "bubble", "busy", "certain", "chin", "concrete", "desk", "diamond", "doom", "drawn", "due", "felicity", "freeze", "frost", "garden", "glide", "harmony", "hopefully", "hunt", "jealous", "lightning", "mama", "mercy", "peel", "physical", "position", "pulse", "punch", "quit", "rant", "respond", "salty", "sane", "satisfy", "savior", "sheep", "slept", "social", "sport", "tuck", "utter", "valley", "wolf", "aim", "alas", "alter", "arrow", "awaken", "beaten", "belief", "brand", "ceiling", "cheese", "clue", "confidence", "connection", "daily", "disguise", "eager", "erase", "essence", "everytime", "expression", "fan", "flag", "flirt", "foul", "fur", "giggle", "glorious", "ignorance", "law", "lifeless", "measure", "mighty", "muse", "north", "opposite", "paradise", "patience", "patient", "pencil", "petal", "plate", "ponder", "possibly", "practice", "slice", "spell", "stock", "strife", "strip", "suffocate", "suit", "tender", "tool", "trade", "velvet", "verse", "waist", "witch", "aunt", "bench", "bold", "cap", "certainly", "click", "companion", "creator", "dart", "delicate", "determine", "dish", "dragon", "drama", "drum", "dude", "everybody", "feast", "forehead", "former", "fright", "fully", "gas", "hook", "hurl", "invite", "juice", "manage", "moral", "possess", "raw", "rebel", "royal", "scale", "scary", "several", "slight", "stubborn", "swell", "talent", "tea", "terrible", "thread", "torment", "trickle", "usually", "vast", "violence", "weave", "acid", "agony", "ashamed", "awe", "belly", "blend", "blush", "character", "cheat", "common", "company", "coward", "creak", "danger", "deadly", "defense", "define", "depend", "desperate", "destination", "dew", "duck", "dusty", "embarrass", "engine", "example", "explore", "foe", "freely", "frustrate", "generation", "glove", "guilty", "health", "hurry", "idiot", "impossible", "inhale", "jaw", "kingdom", "mention", "mist", "moan", "mumble", "mutter", "observe", "ode", "pathetic", "pattern", "pie", "prefer", "puff", "rape", "rare", "revenge", "rude", "scrape", "spiral", "squeeze", "strain", "sunset", "suspend", "sympathy", "thigh", "throne", "total", "unseen", "weapon", "weary"];
var get_crypto_1 = __importDefault(require("./get-crypto"));
var PassPhraseGenerator = {
    generatePass: function (numberOfWords) {
        if (!numberOfWords) {
            numberOfWords = 12;
        }
        //console.log("generating pass ");
        var rndArray = new Uint32Array(numberOfWords);
        get_crypto_1.default.getRandomValues(rndArray);
        var passPhrase = [];
        for (var i in rndArray) {
            passPhrase.push(words[rndArray[i] % words.length]);
        }
        get_crypto_1.default.getRandomValues(rndArray);
        return passPhrase.join(" ");
    }
};
exports.default = PassPhraseGenerator;

},{"./get-crypto":2}],9:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
var gmd_api_caller_1 = require("./gmd-api-caller");
var Provider = /** @class */ (function (_super) {
    __extends(Provider, _super);
    function Provider(baseURL) {
        return _super.call(this, baseURL) || this;
    }
    //Latest block
    Provider.prototype.getBlockNumber = function () {
        return this.apiCall('get', { requestType: 'getBlock' }).then(function (data) { return data.height; });
    };
    Provider.prototype.getBalance = function (rsAccount) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.apiCall('get', { requestType: 'getBalance', account: rsAccount })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.balanceNQT];
                }
            });
        });
    };
    Provider.prototype.createUnsignedTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var unsignedTransaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!transaction.canProcessRequest()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.apiCall('post', transaction.requestJSON)];
                    case 1:
                        unsignedTransaction = _a.sent();
                        transaction.onTransactionRequestProcessed(unsignedTransaction.unsignedTransactionBytes);
                        return [3 /*break*/, 3];
                    case 2: throw new Error('createUnsignedTransaction cannot be processed. transaction=' + JSON.stringify(transaction));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Provider.prototype.broadCastTransactionFromHex = function (signedTransactionHex) {
        return this.apiCall('post', { requestType: 'broadcastTransaction', transactionBytes: signedTransactionHex });
    };
    Provider.prototype.broadcastTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(transaction.canBroadcast() && transaction.signedTransactionBytes)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.broadCastTransactionFromHex(transaction.signedTransactionBytes)];
                    case 1:
                        result = _a.sent();
                        transaction.onBroadcasted(result);
                        return [2 /*return*/, result];
                    case 2: throw new Error('broadCastTransaction cannot be processed. transaction=' + JSON.stringify(transaction));
                }
            });
        });
    };
    return Provider;
}(gmd_api_caller_1.RemoteAPICaller));
exports.Provider = Provider;
module.exports = Provider;

},{"./gmd-api-caller":6}],10:[function(require,module,exports){
"use strict";
/*
    NXT address class, extended version (with error guessing).

    Version: 1.0, license: Public Domain, coder: NxtChg (admin@nxtchg.com).
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSAddress = void 0;
var RSAddress = /** @class */ (function () {
    function RSAddress() {
        this.codeword = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.syndrome = [0, 0, 0, 0, 0];
        this.gexp = [1, 2, 4, 8, 16, 5, 10, 20, 13, 26, 17, 7, 14, 28, 29, 31, 27, 19, 3, 6, 12, 24, 21, 15, 30, 25, 23, 11, 22, 9, 18, 1];
        this.glog = [0, 0, 1, 18, 2, 5, 19, 11, 3, 29, 6, 27, 20, 8, 12, 23, 4, 10, 30, 17, 7, 22, 28, 26, 21, 25, 9, 16, 13, 14, 24, 15];
        this.cwmap = [3, 2, 1, 0, 7, 6, 5, 4, 13, 14, 15, 16, 12, 8, 9, 10, 11];
        this.alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        //var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ345679';
        this.guess = [];
    }
    RSAddress.prototype.ginv = function (a) {
        return this.gexp[31 - this.glog[a]];
    };
    RSAddress.prototype.gmult = function (a, b) {
        if (a == 0 || b == 0)
            return 0;
        var idx = (this.glog[a] + this.glog[b]) % 31;
        return this.gexp[idx];
    }; //__________________________
    RSAddress.prototype.calc_discrepancy = function (lambda, r) {
        var discr = 0;
        for (var i = 0; i < r; i++) {
            discr ^= this.gmult(lambda[i], this.syndrome[r - i]);
        }
        return discr;
    }; //__________________________
    RSAddress.prototype.find_errors = function (lambda) {
        var errloc = [];
        for (var i = 1; i <= 31; i++) {
            var sum = 0;
            for (var j = 0; j < 5; j++) {
                sum ^= this.gmult(this.gexp[(j * i) % 31], lambda[j]);
            }
            if (sum == 0) {
                var pos = 31 - i;
                if (pos > 12 && pos < 27)
                    return [];
                errloc[errloc.length] = pos;
            }
        }
        return errloc;
    }; //__________________________
    RSAddress.prototype.guess_errors = function () {
        var el = 0, b = [0, 0, 0, 0, 0], t = [];
        var deg_lambda = 0, lambda = [1, 0, 0, 0, 0]; // error+erasure locator poly
        // Berlekamp-Massey algorithm to determine error+erasure locator polynomial
        for (var r = 0; r < 4; r++) {
            var discr = this.calc_discrepancy(lambda, r + 1); // Compute discrepancy at the r-th step in poly-form
            if (discr != 0) {
                deg_lambda = 0;
                for (var i = 0; i < 5; i++) {
                    t[i] = lambda[i] ^ this.gmult(discr, b[i]);
                    if (t[i])
                        deg_lambda = i;
                }
                if (2 * el <= r) {
                    el = r + 1 - el;
                    for (i = 0; i < 5; i++) {
                        b[i] = this.gmult(lambda[i], this.ginv(discr));
                    }
                }
                lambda = t.slice(); // copy
            }
            b.unshift(0); // shift => mul by x
        }
        // Find roots of the locator polynomial.
        var errloc = this.find_errors(lambda);
        var errors = errloc.length;
        if (errors < 1 || errors > 2)
            return false;
        if (deg_lambda != errors)
            return false; // deg(lambda) unequal to number of roots => uncorrectable error
        // Compute err+eras evaluator poly omega(x) = s(x)*lambda(x) (modulo x**(4)). Also find deg(omega).
        var omega = [0, 0, 0, 0, 0];
        for (var i_1 = 0; i_1 < 4; i_1++) {
            var t_1 = 0;
            for (var j = 0; j < i_1; j++) {
                t_1 ^= this.gmult(this.syndrome[i_1 + 1 - j], lambda[j]);
            }
            omega[i_1] = t_1;
        }
        // Compute error values in poly-form.
        for (r = 0; r < errors; r++) {
            var t_2 = 0;
            var pos = errloc[r];
            var root = 31 - pos;
            for (i = 0; i < 4; i++) // evaluate Omega at alpha^(-i)
             {
                t_2 ^= this.gmult(omega[i], this.gexp[(root * i) % 31]);
            }
            if (t_2) // evaluate Lambda' (derivative) at alpha^(-i); all odd powers disappear
             {
                var denom = this.gmult(lambda[1], 1) ^ this.gmult(lambda[3], this.gexp[(root * 2) % 31]);
                if (denom == 0)
                    return false;
                if (pos > 12)
                    pos -= 14;
                this.codeword[pos] ^= this.gmult(t_2, this.ginv(denom));
            }
        }
        return true;
    }; //__________________________
    RSAddress.prototype.encode = function () {
        var p = [0, 0, 0, 0];
        for (var i = 12; i >= 0; i--) {
            var fb = this.codeword[i] ^ p[3];
            p[3] = p[2] ^ this.gmult(30, fb);
            p[2] = p[1] ^ this.gmult(6, fb);
            p[1] = p[0] ^ this.gmult(9, fb);
            p[0] = this.gmult(17, fb);
        }
        this.codeword[13] = p[0];
        this.codeword[14] = p[1];
        this.codeword[15] = p[2];
        this.codeword[16] = p[3];
    }; //__________________________
    RSAddress.prototype.reset = function () {
        for (var i = 0; i < 17; i++)
            this.codeword[i] = 1;
    }; //__________________________
    RSAddress.prototype.set_codeword = function (cw, len, skip) {
        if (typeof len === 'undefined')
            len = 17;
        if (typeof skip === 'undefined')
            skip = -1;
        for (var i = 0, j = 0; i < len; i++) {
            if (i != skip)
                this.codeword[this.cwmap[j++]] = cw[i];
        }
    }; //__________________________
    RSAddress.prototype.add_guess = function () {
        var s = this.toString(), len = this.guess.length;
        if (len > 2)
            return;
        for (var i = 0; i < len; i++) {
            if (this.guess[i] == s)
                return;
        }
        this.guess[len] = s;
    }; //__________________________
    RSAddress.prototype.ok = function () {
        var sum = 0;
        for (var i = 1; i < 5; i++) {
            for (var j = 0, t = 0; j < 31; j++) {
                if (j > 12 && j < 27)
                    continue;
                var pos = j;
                if (j > 26)
                    pos -= 14;
                t ^= this.gmult(this.codeword[pos], this.gexp[(i * j) % 31]);
            }
            sum |= t;
            this.syndrome[i] = t;
        }
        return (sum == 0);
    }; //__________________________
    RSAddress.prototype.from_acc = function (acc) {
        var inp = [], out = [], pos = 0, len = acc.length;
        if (len == 20 && acc.charAt(0) != '1')
            return false;
        for (var i = 0; i < len; i++) {
            inp[i] = acc.charCodeAt(i) - '0'.charCodeAt(0);
        }
        do // base 10 to base 32 conversion
         {
            var divide = 0, newlen = 0;
            for (i = 0; i < len; i++) {
                divide = divide * 10 + inp[i];
                if (divide >= 32) {
                    inp[newlen++] = divide >> 5;
                    divide &= 31;
                }
                else if (newlen > 0) {
                    inp[newlen++] = 0;
                }
            }
            len = newlen;
            out[pos++] = divide;
        } while (newlen);
        for (i = 0; i < 13; i++) // copy to codeword in reverse, pad with 0's
         {
            this.codeword[i] = (--pos >= 0 ? out[i] : 0);
        }
        this.encode();
        return true;
    }; //__________________________
    RSAddress.prototype.toString = function () {
        var out = "GMD-";
        for (var i = 0; i < 17; i++) {
            out += this.alphabet[this.codeword[this.cwmap[i]]];
            if ((i & 3) == 3 && i < 13)
                out += '-';
        }
        return out;
    }; //__________________________
    RSAddress.prototype.account_id = function () {
        var out = '', inp = [], len = 13;
        for (var i = 0; i < 13; i++) {
            inp[i] = this.codeword[12 - i];
        }
        do // base 32 to base 10 conversion
         {
            var divide = 0, newlen = 0;
            for (i = 0; i < len; i++) {
                divide = divide * 32 + inp[i];
                if (divide >= 10) {
                    inp[newlen++] = Math.floor(divide / 10);
                    divide %= 10;
                }
                else if (newlen > 0) {
                    inp[newlen++] = 0;
                }
            }
            len = newlen;
            out += String.fromCharCode(divide + '0'.charCodeAt(0));
        } while (newlen);
        return out.split("").reverse().join("");
    }; //__________________________
    RSAddress.prototype.set = function (adr, allow_accounts) {
        if (typeof allow_accounts === 'undefined')
            allow_accounts = true;
        var len = 0;
        this.guess = [];
        this.reset();
        adr = String(adr);
        adr = adr.replace(/(^\s+)|(\s+$)/g, '').toUpperCase();
        if (adr.indexOf("GMD-") == 0)
            adr = adr.substr(4);
        if (adr.match(/^\d{1,20}$/g)) // account id
         {
            if (allow_accounts)
                return this.from_acc(adr);
        }
        else // address
         {
            var clean_1 = [];
            for (var i = 0; i < adr.length; i++) {
                var pos = this.alphabet.indexOf(adr[i]);
                if (pos >= 0) {
                    clean_1[len++] = pos;
                    if (len > 18)
                        return false;
                }
            }
        }
        var clean = [];
        if (len == 16) // guess deletion
         {
            for (var i_2 = 16; i_2 >= 0; i_2--) {
                for (var j = 0; j < 32; j++) {
                    clean[i_2] = j;
                    this.set_codeword(clean);
                    if (this.ok())
                        this.add_guess();
                }
                if (i_2 > 0) {
                    var t = clean[i_2 - 1];
                    clean[i_2 - 1] = clean[i_2];
                    clean[i_2] = t;
                }
            }
        }
        if (len == 18) // guess insertion
         {
            for (var i_3 = 0; i_3 < 18; i_3++) {
                this.set_codeword(clean, 18, i_3);
                if (this.ok())
                    this.add_guess();
            }
        }
        if (len == 17) {
            this.set_codeword(clean);
            if (this.ok())
                return true;
            if (this.guess_errors() && this.ok())
                this.add_guess();
        }
        this.reset();
        return false;
    };
    return RSAddress;
}());
exports.RSAddress = RSAddress;
exports.default = RSAddress;

},{}],11:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
var crypto_util_1 = require("./crypto-util");
var transaction_1 = require("./transactions/transaction");
var Converters = crypto_util_1.CryptoUtil.Converters;
var Signer = /** @class */ (function () {
    function Signer(publicKey, privKey) {
        this.publicKey = publicKey;
        this.privateKey = privKey;
    }
    Signer.prototype.signTransactionBytes = function (unsignedTransactionHex) {
        return __awaiter(this, void 0, void 0, function () {
            var sig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, crypto_util_1.CryptoUtil.Crypto.signHex(unsignedTransactionHex, this.privateKey)];
                    case 1:
                        sig = _a.sent();
                        return [2 /*return*/, unsignedTransactionHex.slice(0, 192) + sig + unsignedTransactionHex.slice(320)];
                }
            });
        });
    };
    Signer.prototype.signTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var signedTransactionBytes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(transaction.state === transaction_1.TransactionState.UNSIGNED && transaction.unsignedTransactionBytes && Converters.isHex(transaction.unsignedTransactionBytes))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.signTransactionBytes(transaction.unsignedTransactionBytes)];
                    case 1:
                        signedTransactionBytes = _a.sent();
                        transaction.onSigned(signedTransactionBytes);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Signer.prototype.signHex = function (hexMessage) {
        return crypto_util_1.CryptoUtil.Crypto.signHex(hexMessage, this.privateKey);
    };
    Signer.prototype.signStr = function (message) {
        return this.signHex(Converters.strToHex(message));
    };
    Signer.verifySignatureHex = function (signature, unsignedHexMessage, publicKey) {
        return crypto_util_1.CryptoUtil.Crypto.verifySignature(signature, unsignedHexMessage, publicKey);
    };
    Signer.verifySignatureStr = function (signature, unsignedStrMessage, publicKey) {
        return this.verifySignatureHex(signature, Converters.strToHex(unsignedStrMessage), publicKey);
    };
    return Signer;
}());
exports.Signer = Signer;

},{"./crypto-util":4,"./transactions/transaction":12}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.TransactionState = void 0;
var crypto_util_1 = require("../crypto-util");
var Converters = crypto_util_1.CryptoUtil.Converters;
var TransactionState;
(function (TransactionState) {
    TransactionState[TransactionState["ERROR"] = 0] = "ERROR";
    TransactionState[TransactionState["REQUEST_CREATED"] = 1] = "REQUEST_CREATED";
    TransactionState[TransactionState["UNSIGNED"] = 2] = "UNSIGNED";
    TransactionState[TransactionState["SIGNED"] = 3] = "SIGNED";
    TransactionState[TransactionState["BROADCASTED"] = 4] = "BROADCASTED";
    TransactionState[TransactionState["CONFIRMED"] = 5] = "CONFIRMED";
    TransactionState[TransactionState["REJECTED"] = 6] = "REJECTED";
})(TransactionState = exports.TransactionState || (exports.TransactionState = {}));
/**
 * Any transaction has 5 steps:
 * 1. Create request JSON
 * 2. Process request JSON to an unsigned transaction (remote API call to a node is necessary)
 * 3. Sign the unsigned transaction
 * 4. Broadcast the signed transaction (remote API call to a node is necessary)
 * 5. [Optional] Transaction is confirmed after the trasaction is written to the blockchain and at leat
 *    one block is written on top of the transaction block (remote API call to a node is necessary).
 *
 * The state of the transaction can only go through each step in the specified order.
 */
var Transaction = /** @class */ (function () {
    function Transaction(requestJSON) {
        this._unsignedTransactionBytes = null;
        this._signedTransactionBytes = null;
        this._transactionID = null;
        this._fullHash = null;
        this._requestJSON = requestJSON;
        this._state = TransactionState.REQUEST_CREATED;
    }
    Transaction.prototype.canProcessRequest = function () {
        if ('secretPhrase' in this._requestJSON) {
            throw new Error('Do not send secret password to node!');
        }
        return this._state === TransactionState.REQUEST_CREATED;
    };
    Transaction.prototype.onTransactionRequestProcessed = function (unsignedTransactionBytes) {
        if (this.canProcessRequest() && Converters.isHex(unsignedTransactionBytes)) {
            this._unsignedTransactionBytes = unsignedTransactionBytes;
            this._state = TransactionState.UNSIGNED;
        }
        else {
            throw new Error('onTransactionRequestProcessed: Transaction cannot be processed');
        }
    };
    Transaction.prototype.canBeSigned = function () {
        return this._state === TransactionState.UNSIGNED && Converters.isHex(this._unsignedTransactionBytes);
    };
    Transaction.prototype.onSigned = function (signedTransactionBytes) {
        if (this.canBeSigned() && Converters.isHex(signedTransactionBytes)) {
            this._signedTransactionBytes = signedTransactionBytes;
            this._state = TransactionState.SIGNED;
        }
    };
    Transaction.prototype.canBroadcast = function () {
        return Converters.isHex(this.signedTransactionBytes) && this.state === TransactionState.SIGNED;
    };
    Transaction.prototype.onBroadcasted = function (result) {
        if (this.canBroadcast()) {
            this._transactionID = result.transaction;
            this._fullHash = result.fullHash;
            this._state == TransactionState.BROADCASTED;
        }
        else {
            throw new Error('Something went wrong on transaction broadcast');
        }
    };
    Object.defineProperty(Transaction.prototype, "requestJSON", {
        get: function () {
            return this._requestJSON;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transaction.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transaction.prototype, "unsignedTransactionBytes", {
        get: function () {
            return this._unsignedTransactionBytes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transaction.prototype, "signedTransactionBytes", {
        get: function () {
            return this._signedTransactionBytes;
        },
        enumerable: false,
        configurable: true
    });
    return Transaction;
}());
exports.Transaction = Transaction;

},{"../crypto-util":4}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
var crypto_util_1 = require("./crypto-util");
var key_encryption_1 = require("./key-encryption");
var pass_gen_1 = __importDefault(require("./pass-gen"));
var signer_1 = require("./signer");
var Wallet = /** @class */ (function (_super) {
    __extends(Wallet, _super);
    function Wallet(publicKey, privKey, accountId, provider) {
        if (provider === void 0) { provider = null; }
        var _this = _super.call(this, publicKey, privKey) || this;
        _this.accountId = accountId;
        _this.accountRS = crypto_util_1.CryptoUtil.Crypto.accountIdToRS(accountId);
        _this.provider = provider;
        return _this;
    }
    Wallet.prototype.connect = function (provider) {
        this.provider = provider;
    };
    //static wallet creation functions
    Wallet.fromPassphrase = function (passPhrase) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, publicKey, privateKey, accountId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, crypto_util_1.CryptoUtil.Crypto.getWalletDetails(passPhrase)];
                    case 1:
                        _a = _b.sent(), publicKey = _a.publicKey, privateKey = _a.privateKey, accountId = _a.accountId;
                        return [2 /*return*/, new Wallet(publicKey, privateKey, accountId)];
                }
            });
        });
    };
    Wallet.encryptedJSONFromPassPhrase = function (passPhrase, encryptionPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var seed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, crypto_util_1.CryptoUtil.Crypto.getSeed(passPhrase)];
                    case 1:
                        seed = _a.sent();
                        return [2 /*return*/, key_encryption_1.KeyEncryption.encryptBytes(seed, encryptionPassword)];
                }
            });
        });
    };
    Wallet.fromEncryptedJSON = function (encryptedJSON, encryptionPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var seed, _a, publicKey, privateKey, accountId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, key_encryption_1.KeyEncryption.decryptToBytes(encryptedJSON, encryptionPassword)];
                    case 1:
                        seed = _b.sent();
                        return [4 /*yield*/, crypto_util_1.CryptoUtil.Crypto.getWalletDetailsFromSeed(seed)];
                    case 2:
                        _a = _b.sent(), publicKey = _a.publicKey, privateKey = _a.privateKey, accountId = _a.accountId;
                        return [2 /*return*/, new Wallet(publicKey, privateKey, accountId)];
                }
            });
        });
    };
    Wallet.accountIdFromPublicKey = function (publicKeyHex) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, crypto_util_1.CryptoUtil.Crypto.publicKeyToAccountId(publicKeyHex)];
            });
        });
    };
    Wallet.generatePassphrase = function (numberOfWords) {
        return pass_gen_1.default.generatePass(numberOfWords);
    };
    return Wallet;
}(signer_1.Signer));
exports.Wallet = Wallet;
module.exports = Wallet;

},{"./crypto-util":4,"./key-encryption":7,"./pass-gen":8,"./signer":11}]},{},[3]);
