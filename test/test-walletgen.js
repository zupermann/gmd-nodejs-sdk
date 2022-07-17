const GMD = require('../gmd-crypto')

TestWalletGen = {}
TestWalletGen.test = () => {
    test1();
    test2();
    test3();
};

test1 = () => {
    PassPhraseGenerator = require('../pass-gen');
    let passPhrase = PassPhraseGenerator.generatePass(24);
    console.log(passPhrase);
}

test2 = () => {
    //GMD.baseURL = 'test-errors';
    GMD.generateAccount().then(data => {
        console.log("Generated wallet " + JSON.stringify(data, null, 2))
    }).catch(e => { console.log("Error: " + e) })
}

test3 = () => {
    console.log('testing checkRSAddress');
    GMD.checkRSAddress('GMD-XRDW-5KPH-8ZQ7-65G9L').then(console.log).catch(console.log(err));
}

module.exports = TestPassGen;

