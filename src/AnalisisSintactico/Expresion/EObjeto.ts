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

    constructor(entradas: [InfoToken<string>, Expresion?][], infoObjeto: InfoToken<string>, esImport = false) {
        this.entradas = entradas;
        this.inicioPE = infoObjeto.inicio;
        this.numLineaPE = infoObjeto.numLinea;
        this.posInicioLineaPE = infoObjeto.posInicioLinea;
        this.esImport = esImport;
    }
}
