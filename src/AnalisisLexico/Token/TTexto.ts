import { InfoToken } from "../InfoToken";

export class TTexto {
    type = "TTexto" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }

    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}
