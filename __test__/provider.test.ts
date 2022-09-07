import { Provider } from '../dist/index.js';
import { expect, test } from '@jest/globals';

let provider = new Provider(new URL('https://node.thecoopnetwork.io:6877'));
const pageSize = 3;
const keyRegex = /^[0-9a-fA-F]{64}$/;
const rsRegex = /^GMD(\-([2-9a-zA-Z]){4}){3}\-([2-9a-zA-Z]){5}$/

test('Get transactions bulk', async () => {
    const paramsGetTransactions = {
        requestType: 'getTransactionsBulk',
        pageSize: pageSize,
        page: 0
    }


    let data = await provider.apiCall('get', paramsGetTransactions);
    expect(Array.isArray(data.Transactions)).toBe(true);
    expect((data.Transactions as Array<unknown>).length).toBe(pageSize);
    const fullhash0 = ((data.Transactions as Array<unknown>)[0] as Record<string, string | number>).FULL_HASH;
    const height1 = ((data.Transactions as Array<unknown>)[1] as Record<string, string | number>).HEIGHT;
    const sender2 = ((data.Transactions as Array<unknown>)[2] as Record<string, string | number>).SENDER_ID;
    expect(fullhash0).toMatch(keyRegex);
    expect(height1).not.toBeNaN();
    expect(sender2).toMatch(rsRegex);
})

test('Get block no', async () => {
    const blockNo = await provider.getBlockNumber();
    expect(blockNo).not.toBeNaN();
});

test('Get outbound tansactions', async () => {
    const rs = 'GMD-N2L2-GZXR-NES8-CJMBC';
    const data = await provider.getTransactions(true, rs, 1, 0);
    expect(Array.isArray(data)).toBe(true);
    expect((data[0] as Record<string, string>).SENDER_ID).toBe(rs);
    expect((data[0] as Record<string, string>).FULL_HASH).toMatch(keyRegex);
});
