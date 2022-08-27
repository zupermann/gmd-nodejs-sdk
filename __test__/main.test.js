import { testWallet } from './wallet.test.js';
import { testProvider } from './provider.test.js';
import { testSendMoney } from './send-money.test.js';
import { testEncryption } from './encryption.test.js';

export const test = async () => {
    console.log('---Testing wallet...');
    await testWallet();
    console.log('---Testing wallet finished.');

    console.log('---Testing provider...');
    await testProvider();
    console.log('---Testing provider finished.');


    console.log('---Testing send money...');
    await testSendMoney();
    console.log('---Testing send money finished.');

    console.log('---Testing encryption...')
    await testEncryption();
    console.log('---Testing encryption finished.')
};

await test();
