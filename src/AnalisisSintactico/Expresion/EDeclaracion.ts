import { EIdentificador } from "./EIdentificador";
import { Expresion } from "../Expresion";

export class EDeclaracion {
    type = "EDeclaracion" as const
    readonly mut: boolean
    readonly id: EIdentificador
    readonly valorDec: Expresion
    readonly inicioDec: number
    readonly numLineaDec: number
    readonly posInicioLineaDec: number

    constructor(mut: boolean, id: EIdentificador, valorDec: Expresion, inicioDec: number, numLineaDec: number, posInicioLineaDec: number) {
        this.mut = mut;
        this.id = id;
        this.valorDec = valorDec;
        this.inicioDec = inicioDec;
        this.numLineaDec = numLineaDec;
        this.posInicioLineaDec = posInicioLineaDec;
    }
}
