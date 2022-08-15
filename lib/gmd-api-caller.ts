const axios = require('./get-axios');
export type Logger = (msg: string) => void;

export class RemoteAPICaller {
    baseURL: URL;
    log: Logger | null;
    constructor(baseURL: URL) {
        this.baseURL = baseURL;
        this.log = null;
    }

    setLogger(logger: Logger) {
        this.log = logger;
    }

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
    async apiCall(method: string, params: any): Promise<any> {
        const { url, httpTimeout } = this.processParams(params);
        const config = { method: method, url: url + 'nxt?' + (new URLSearchParams(params)).toString(), httpTimeout: "" };
        if (httpTimeout && httpTimeout > 0) {
            config.httpTimeout = httpTimeout;
        }
        return axios(config).then((res: any) => {
            if (this.log) this.log(`Response status on request to ${config.url} is ${res.status}\nresponse body:\n${JSON.stringify(res.data, null, 2)}`);
            return res.data;
        });
    }

    private processParams(params: any): any {
        let url;
        let httpTimeout;
        if (params) {
            if ('secretPhrase' in params) {
                delete params.secretPhrase; // password is not sent to server - remove it from params - it is needed only to do local signing
            }
            if ('httpTimeout' in params) {
                httpTimeout = params.httpTimeout;
                delete params.httpTimeout;
            }

            if ('baseURL' in params) {
                url = params.baseURL;
                delete params.baseURL;
            } else {
                url = this.baseURL.toString();
            }
        }
        return { url, httpTimeout };
    }


}

