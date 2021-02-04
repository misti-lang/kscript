import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";

export class EBloque implements IPosition {
    type = "EBloque" as const
    readonly bloque: Array<Expresion>
    readonly esExpresion: boolean
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(bloque: Array<Expresion>, esExpresion: boolean = true) {
        this.bloque = bloque;
        this.esExpresion = esExpresion;
        if (this.bloque.length >= 1) {
            const e = this.bloque[0] as Expresion & IPosition;
            this.inicioPE = e.inicioPE;
            this.numLineaPE = e.numLineaPE;
            this.posInicioLineaPE = e.posInicioLineaPE;
        } else {
            this.inicioPE = 0;
            this.numLineaPE = 0;
            this.posInicioLineaPE = 0;
        }
    }
}
