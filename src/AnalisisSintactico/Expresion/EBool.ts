import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { IPosition } from "./IPosition";

export class EBool implements IPosition {
    type = "EBool" as const
    readonly info: InfoToken<boolean>
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(info: InfoToken<boolean>) {
        this.info = info;
        this.inicioPE = info.inicio;
        this.numLineaPE = info.numLinea;
        this.posInicioLineaPE = info.posInicioLinea;
    }
}
