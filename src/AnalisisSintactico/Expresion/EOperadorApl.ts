import { eOperador } from "./EOperador";
import { Expresion } from "../Expresion";

export class EOperadorApl {
    type = "EOperadorApl" as const
    readonly op: eOperador
    readonly izq: Expresion
    readonly der: Expresion

    constructor(op: eOperador, izq: Expresion, der: Expresion) {
        this.op = op;
        this.izq = izq;
        this.der = der;
    }
}
