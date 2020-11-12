import { eOperador } from "./EOperador";
import { Expresion } from "../Expresion";

export class EOperadorUnarioIzq {
    type = "EOperadorUnarioIzq" as const
    readonly op: eOperador
    readonly expr: Expresion

    constructor(op: eOperador, expr: Expresion) {
        this.op = op;
        this.expr = expr;
    }
}
