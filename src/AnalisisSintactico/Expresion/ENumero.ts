import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class ENumero {
    type = "ENumero" as const
    readonly info: InfoToken<string>

    constructor(info: InfoToken<string>) {
        this.info = info;
    }
}
