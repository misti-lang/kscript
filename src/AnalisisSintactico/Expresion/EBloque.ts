import { Expresion } from "../Expresion";

export class EBloque {
    type = "EBloque" as const
    readonly bloque: Array<Expresion>
    readonly esExpresion: boolean

    constructor(bloque: Array<Expresion>, esExpresion: boolean = true) {
        this.bloque = bloque;
        this.esExpresion = esExpresion;
    }
}
