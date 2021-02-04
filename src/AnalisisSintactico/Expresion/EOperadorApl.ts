import { eOperador } from "./EOperador";
import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";

export class EOperadorApl implements IPosition {
    type = "EOperadorApl" as const
    readonly op: eOperador
    readonly izq: Expresion
    readonly der: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(op: eOperador, izq: Expresion, der: Expresion) {
        this.op = op;
        this.izq = izq;
        this.der = der;
        this.inicioPE = (izq as Expresion & IPosition).inicioPE;
        this.numLineaPE = (izq as Expresion & IPosition).numLineaPE;
        this.posInicioLineaPE = (izq as Expresion & IPosition).posInicioLineaPE;
    }
}
