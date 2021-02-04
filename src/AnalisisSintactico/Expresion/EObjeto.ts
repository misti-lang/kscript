import { Expresion } from "../Expresion";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { IPosition } from "./IPosition";

export class EObjeto implements IPosition {
    type = "EObjeto" as const

    readonly entradas: [InfoToken<string>, Expresion?][]
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number
    readonly esImport: boolean

    constructor(entradas: [InfoToken<string>, Expresion?][], inicio: number, numLinea: number, posInicioLinea: number, esImport = false) {
        this.entradas = entradas;
        this.inicioPE = inicio;
        this.numLineaPE = numLinea;
        this.posInicioLineaPE = posInicioLinea;
        this.esImport = esImport;
    }
}
