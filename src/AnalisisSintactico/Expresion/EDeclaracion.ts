import { EIdentificador } from "./EIdentificador";
import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";
import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EDeclaracion implements IPosition {
    type = "EDeclaracion" as const
    readonly mut: boolean
    readonly id: EIdentificador
    readonly valorDec: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(mut: boolean, id: EIdentificador, valorDec: Expresion, infoToken: InfoToken<string>) {
        this.mut = mut;
        this.id = id;
        this.valorDec = valorDec;
        this.inicioPE = infoToken.inicio;
        this.numLineaPE = infoToken.numLinea;
        this.posInicioLineaPE = infoToken.posInicioLinea;
    }
}
