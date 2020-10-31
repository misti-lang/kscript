import { InfoToken } from "../InfoToken";

export class TBool {
    type = "TBool" as const
    token: InfoToken<boolean>

    constructor(token: InfoToken<boolean>) {
        this.token = token;
    }

    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}
