import { eOperador } from "./EOperador";
import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";

export class EOperadorUnarioIzq implements IPosition {
    type = "EOperadorUnarioIzq" as const
    readonly op: eOperador
    readonly expr: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(op: eOperador, expr: Expresion) {
        this.op = op;
        this.expr = expr;
        this.inicioPE = op.inicioPE;
        this.numLineaPE = op.numLineaPE;
        this.posInicioLineaPE = op.posInicioLineaPE;
    }
}
