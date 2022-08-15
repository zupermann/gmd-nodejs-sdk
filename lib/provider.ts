import { RemoteAPICaller } from "./gmd-api-caller";


export interface IProvider {
    getBlockNumber(): Promise<number>;
}

export class Provider extends RemoteAPICaller implements IProvider {
    constructor(baseURL: URL) {
        super(baseURL);
    }

    //Letest block
    async getBlockNumber(): Promise<number> {
        return 0;
    }
}


module.exports = Provider;