import { EIdentificador } from "./EIdentificador";
import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";

export class EDeclaracion implements IPosition {
    type = "EDeclaracion" as const
    readonly mut: boolean
    readonly id: EIdentificador
    readonly valorDec: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(mut: boolean, id: EIdentificador, valorDec: Expresion, inicioDec: number, numLineaDec: number, posInicioLineaDec: number) {
        this.mut = mut;
        this.id = id;
        this.valorDec = valorDec;
        this.inicioPE = inicioDec;
        this.numLineaPE = numLineaDec;
        this.posInicioLineaPE = posInicioLineaDec;
    }
}
