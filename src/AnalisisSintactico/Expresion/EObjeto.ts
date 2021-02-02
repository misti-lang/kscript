import { Expresion } from "../Expresion";
import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EObjeto {
    type = "EObjeto" as const

    readonly entradas: [InfoToken<string>, Expresion?][]
    readonly inicio: number
    readonly numLinea: number
    readonly posInicioLinea: number
    readonly esImport: boolean

    constructor(entradas: [InfoToken<string>, Expresion?][], inicio: number, numLinea: number, posInicioLinea: number, esImport = false) {
        this.entradas = entradas;
        this.inicio = inicio;
        this.numLinea = numLinea;
        this.posInicioLinea = posInicioLinea;
        this.esImport = esImport;
    }
}
