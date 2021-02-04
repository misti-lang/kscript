import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";
import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EWhile implements IPosition {
    type = "EWhile" as const

    readonly condicion: Expresion
    readonly cuerpo: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(condicion: Expresion, cuerpo: Expresion, infoWhile: InfoToken<string>) {
        this.condicion = condicion;
        this.cuerpo = cuerpo;
        this.inicioPE = infoWhile.inicio;
        this.numLineaPE = infoWhile.numLinea;
        this.posInicioLineaPE = infoWhile.posInicioLinea;
    }
}
