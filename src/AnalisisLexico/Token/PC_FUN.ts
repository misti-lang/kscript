import { InfoToken } from "../InfoToken";

export class PC_FUN {
    type = "PC_FUN" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }

    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}
