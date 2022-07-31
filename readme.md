### Intro 

- This is an SDK to interact with Coop Network Node.
- Main use is for local signing of transactions.
- Offers helper functions to easily call Coop Networl node API.
- This SDK was initially designed for NodeJS. For running it in browser please see browser directory
  - please read browser/readme.md and browser/index.html example
- For more API details please read comments in gmd-crypto.js file.

### Instructions
- To run tests: 
  ```
  npm install
  npm run test
  ```
- To use in your NodeJS app:
  ```
  npm install gmd-nodejs-sdk
  ```

##### For browser usage please see browser directory readme.md and index.html example.

### Examples on hot to call the GMD node API
- For a complete list of API methods and their exact parameters you can see them on any node in a browser at address <GMD node address>/test (e.g. https://node.thecoopnetwork.io/test )
- All examples in this readme.txt can also be found and ran in test directory.
- By default the remote GMD node will be https://node.thecoopnetwork.io. If you want to change it, use:
```
GMD = require('gmd-nodejs-sdk');
GMD.setURL('https://node2.thecoopnetwork.io')
```



- Creating GMD transfers each 15 minutes:

```
require('node-cron').schedule('0,15,30,45 * * * *', () => {
  GMD.sendMoney('GMD-43MP-76UW-L69N-ALW39', '200000', 'my secret passphrase that will not be sent on the wire but only be used for local    signing', '100000000');
});
```

- Getting last transactions:
    - optional parameters allow filtering by transaction type, subtype, sender or receiver.
```
  paramsGetTransactions = {
      requestType: 'getTransactionsBulk',
      pageSize: 3,
      page: 0
  }
  GMD.apiCall('get', paramsGetTransactions, (res) => {
      console.log('Result trasnactions: \n' + JSON.stringify(res, null, 2));
  })
```
- Getting accounts (ordered by balance):
- Example of specifying a GMD node in the request:
```
  paramsGetAccounts = {
      requestType: 'getAccountsBulk',
      pageSize: 3,
      page: 0,
      baseURL: 'https://node.thecoopnetwork.io'
  }
  GMD.apiCall('get', paramsGetAccounts).then((res) => {
      console.log('Result trasnactions: \n' + JSON.stringify(res, null, 2));
  });
```
- Generating a new wallet:
  ```
    GMD.generateAccount().then(data => {
        console.log("Generated wallet " + JSON.stringify(data, null, 2))
    }).catch(e => { console.log("Error: " + e) })
  ```
  - Example output:
    ```
    {
      "accountRS": "GMD-X6NT-5SAJ-CUG7-7E2AC",
      "publicKey": "c80407d864159a394513fb6e7a9bd9d6a477491a08fc8dc4ef0e94d5141fdf7e",
      "requestProcessingTime": 4,
      "account": "6133916015753335449",
      "secretPassphrase": "dry survive single gasp spring blink never something movie leave heartbeat paint"
    }
    ```
  - Secret passphrase is not sent to the network. It is generated locally, then a public key is derived from it and only this public key is sent over the network to a Coop Network node to retrieve the Reed-Solomon account id (accountRS).
- `GMD.checkRSAddress('GMD-XRDW-5KPH-8ZQ7-65G9L').then(console.log).catch(console.log(err));`
  - returns true if RS account checksum and format checks out, false if invalid address.
  - Actual check is done remotely on a Coop Network Node, so lack of connectivity will result in error thrown.
