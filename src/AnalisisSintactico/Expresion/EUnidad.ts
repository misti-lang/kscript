import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { IPosition } from "./IPosition";

export class EUnidad implements IPosition {
    type = "EUnidad" as const
    readonly info: InfoToken<void>
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(info: InfoToken<void>) {
        this.info = info;
        this.inicioPE = info.inicio;
        this.numLineaPE = info.numLinea;
        this.posInicioLineaPE = info.posInicioLinea;
    }
}
