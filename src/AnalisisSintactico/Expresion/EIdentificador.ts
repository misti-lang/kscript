import { Signatura } from "../Signatura";
import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EIdentificador {
    type = "EIdentificador" as const
    readonly signatura: Signatura
    readonly valorId: InfoToken<string>

    constructor(signatura: Signatura, valorId: InfoToken<string>) {
        this.signatura = signatura;
        this.valorId = valorId;
    }
}
