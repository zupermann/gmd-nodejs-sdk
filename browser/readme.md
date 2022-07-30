## Build
- Following npm command would create in browser/dist directory a gmd-sdk.js (pretty), and a gmd-sdk.min.js (uglyfied)

```
cd ..
npm install
npm run build-browser
```

- Once the gmd-sdk.js or gmd-sdk.min.js scripts are loaded, a global object called GMD will allow interacting with the node.
- Axios is a prerequiste and must be included (see example in index.html).
- An example on how to use one of these 2 files can be found in the 'browser/index.html' file in this directory.
