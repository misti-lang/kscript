import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";

export class EWhile implements IPosition {
    type = "EWhile" as const

    readonly condicion: Expresion
    readonly cuerpo: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(condicion: Expresion, cuerpo: Expresion, inicio: number, numLinea: number, posInicioLinea: number) {
        this.condicion = condicion;
        this.cuerpo = cuerpo;
        this.inicioPE = inicio;
        this.numLineaPE = numLinea;
        this.posInicioLineaPE = posInicioLinea;
    }
}
