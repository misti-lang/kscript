import { InfoToken } from "../InfoToken";

export class TIdentificador {
    type = "TIdentificador" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}
