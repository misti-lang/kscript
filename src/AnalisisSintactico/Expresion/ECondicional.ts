import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";
import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class ECondicional implements IPosition {
    type = "ECondicional" as const

    readonly exprCondicion: [Expresion, Expresion]
    readonly exprElif?: [Expresion, Expresion][]
    readonly exprElse?: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(
        infoIf: InfoToken<string>,
        exprCondicion: [Expresion, Expresion],
        exprElif?: [Expresion, Expresion][],
        exprElse?: Expresion
    ) {
        this.exprCondicion = exprCondicion;
        this.exprElif = exprElif;
        this.exprElse = exprElse;
        this.inicioPE = infoIf.inicio;
        this.numLineaPE = infoIf.numLinea;
        this.posInicioLineaPE = infoIf.posInicioLinea;
    }

}
