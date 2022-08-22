import { Provider, Signer, Transaction, SendMoney, Wallet } from "../dist/index.js";


export {
    Wallet, Provider, Signer, Transaction, SendMoney
}

window.GMD = { "Provider": Provider, "Signer": Signer, "Transaction": Transaction, "SendMoney": SendMoney, "Wallet": Wallet };