import { Expresion } from "../Expresion";
import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EObjeto {
    type = "EObjeto" as const

    readonly entradas: [InfoToken<string>, Expresion][]
    readonly inicio: number
    readonly numLinea: number
    readonly posInicioLinea: number

    constructor(entradas: [InfoToken<string>, Expresion][], inicio: number, numLinea: number, posInicioLinea: number) {
        this.entradas = entradas;
        this.inicio = inicio;
        this.numLinea = numLinea;
        this.posInicioLinea = posInicioLinea;
    }
}
