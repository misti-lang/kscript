import { Expresion } from "../Expresion";

export class EWhile {
    type = "EWhile" as const

    readonly condicion: Expresion
    readonly cuerpo: Expresion
    readonly inicio: number
    readonly numLinea: number
    readonly posInicioLinea: number

    constructor(condicion: Expresion, cuerpo: Expresion, inicio: number, numLinea: number, posInicioLinea: number) {
        this.condicion = condicion;
        this.cuerpo = cuerpo;
        this.inicio = inicio;
        this.numLinea = numLinea;
        this.posInicioLinea = posInicioLinea;
    }
}
