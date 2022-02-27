### Examples on hot to call the GMD node API
- For a complete list of API methods and their exact parameters you can see them on any node in a browser at address <GMD node address>/test (e.g. https://node.thecoopnetwork.io/test )
- By default the remote GMD node will be https://node.thecoopnetwork.io. If you want to change it, use:
`GMD.setURL('https://node.thecoopnetwork.io')`


- Creating GMD transfers each 15 minutes:

```
require('node-cron').schedule('0,15,30,45 * * * *', () => {
  const dataSendMoney = {
    requestType: 'sendMoney',
    recipient: 'GMD-43MP-76UW-L69N-ALW39',
    amountNQT: '10000000000',
    secretPhrase: 'my secret passphrase that will not be sent on the wire but only be used for local signing',
    feeNQT: '1000000000',
    deadline: '15'
  };

  GMD.apiCall('post', dataSendMoney, (res)=> {
    console.log('This is a callback example. Data received back on api calls:\n'+JSON.stringify(res, null, 2));
  });
});
```

- Getting last transactions:
    - optional parameters allow filtering by transaction type, subtype, sender or receiver.
```
const paramsGetTransactions = { 
    requestType: 'getTransactionsBulk',
    pageSize: 5,
    page: 0
}
GMD.apiCall('get', paramsGetTransactions, (res)=>{
    console.log('Result trasnactions: \n'+JSON.stringify(res, null, 2));
})
```
- Getting accounts (ordered by balance):
```
const paramsGetAccounts = {
    requestType: 'getAccountsBulk',
    pageSize: 5,
    page: 0
}
```