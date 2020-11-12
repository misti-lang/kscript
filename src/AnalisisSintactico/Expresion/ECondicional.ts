import { Expresion } from "../Expresion";

export class ECondicional {
    type = "ECondicional" as const

    readonly exprCondicion: [Expresion, Expresion]
    readonly exprElif?: [Expresion, Expresion][]
    readonly exprElse?: Expresion
    readonly inicio: number
    readonly numLinea: number
    readonly posInicioLinea: number

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
        this.inicio = inicioDec;
        this.numLinea = numLineaDec;
        this.posInicioLinea = posInicioLineaDec;
    }
}
