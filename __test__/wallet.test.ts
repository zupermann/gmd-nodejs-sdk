import { describe, expect, test } from '@jest/globals';
import { Wallet } from '../dist/index.js';

test('wallet test', async () => {
    await Wallet.fromPassphrase('abc').then(a => console.log(a));
})