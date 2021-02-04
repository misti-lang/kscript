import { InfoToken } from "../InfoToken";

export class TNuevaLinea {
    type = "TNuevaLinea" as const
    token: InfoToken<undefined>

    constructor(token: InfoToken<undefined>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}
