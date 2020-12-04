import { Expresion } from "../Expresion";

export class EArray {
    type = "EArray" as const

    readonly expresiones: Expresion[];
    readonly inicio: number
    readonly numLinea: number
    readonly posInicioLinea: number

    constructor(expresiones: Expresion[], inicio: number, numLinea: number, posInicioLinea: number) {
        this.expresiones = expresiones;
        this.inicio = inicio;
        this.numLinea = numLinea;
        this.posInicioLinea = posInicioLinea;
    }
}
