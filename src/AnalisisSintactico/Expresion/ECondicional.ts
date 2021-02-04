import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";

export class ECondicional implements IPosition {
    type = "ECondicional" as const

    readonly exprCondicion: [Expresion, Expresion]
    readonly exprElif?: [Expresion, Expresion][]
    readonly exprElse?: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(
        inicioDec: number,
        numLineaDec: number,
        posInicioLineaDec: number,
        exprCondicion: [Expresion, Expresion],
        exprElif?: [Expresion, Expresion][],
        exprElse?: Expresion
    ) {
        this.exprCondicion = exprCondicion;
        this.exprElif = exprElif;
        this.exprElse = exprElse;
        this.inicioPE = inicioDec;
        this.numLineaPE = numLineaDec;
        this.posInicioLineaPE = posInicioLineaDec;
    }
}
