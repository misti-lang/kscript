import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class ETexto {
    type = "ETexto" as const
    readonly info: InfoToken<string>

    constructor(info: InfoToken<string>) {
        this.info = info;
    }
}
