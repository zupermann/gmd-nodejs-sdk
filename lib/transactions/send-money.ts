import { Transaction } from "./transaction";

export class SendMoney extends Transaction {

    getRequestType(): string {
        return "sendMoney";
    }

    private constructor(requestJSON: Record<string, any>) {
        super(requestJSON)
    }

    public static createTransaction(recipient: string, amountNQT: string, senderPublicKey: string,
        feeNQT = '100000000', deadline = 1440, message = ""): SendMoney {

        const reqJSON = {
            recipient: recipient,
            amountNQT: amountNQT,
            publicKey: senderPublicKey,
            feeNQT: feeNQT,
            deadline: deadline,
            message: message

        }
        return new SendMoney(reqJSON);
    }
}

module.exports = SendMoney;