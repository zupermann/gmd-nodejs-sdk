import { Wallet } from '../lib/index';

test('wallet test', () => {
    Wallet.fromPassphrase('abc').then(a => console.log(a));
})