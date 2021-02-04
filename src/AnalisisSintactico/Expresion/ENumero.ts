import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { IPosition } from "./IPosition";

export class ENumero implements IPosition {
    type = "ENumero" as const
    readonly info: InfoToken<string>
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(info: InfoToken<string>) {
        this.info = info;
        this.inicioPE = info.inicio;
        this.numLineaPE = info.numLinea;
        this.posInicioLineaPE = info.posInicioLinea;
    }
}
