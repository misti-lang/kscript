import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";

export class EArray implements IPosition {
    type = "EArray" as const

    readonly expresiones: Expresion[];
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(expresiones: Expresion[], inicio: number, numLinea: number, posInicioLinea: number) {
        this.expresiones = expresiones;
        this.inicioPE = inicio;
        this.numLineaPE = numLinea;
        this.posInicioLineaPE = posInicioLinea;
    }
}
