import { Signatura } from "../Signatura";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { IPosition } from "./IPosition";

export class EIdentificador implements IPosition {
    type = "EIdentificador" as const
    readonly signatura: Signatura
    readonly info: InfoToken<string>
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(signatura: Signatura, info: InfoToken<string>) {
        this.signatura = signatura;
        this.info = info;
        this.inicioPE = info.inicio;
        this.numLineaPE = info.numLinea;
        this.posInicioLineaPE = info.posInicioLinea;
    }
}
