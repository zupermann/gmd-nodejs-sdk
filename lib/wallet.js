

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