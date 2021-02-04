import { EIdentificador } from "./EIdentificador";
import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";

export class EDeclaracionFuncion implements IPosition {
    type = "EDeclaracionFuncion" as const
    readonly id: EIdentificador
    readonly parametros: EIdentificador[]
    readonly valor: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(id: EIdentificador, parametros: EIdentificador[], valor: Expresion, inicio: number, numLinea: number, posInicioLinea: number) {
        this.id = id;
        this.parametros = parametros;
        this.valor = valor;
        this.inicioPE = inicio;
        this.numLineaPE = numLinea;
        this.posInicioLineaPE = posInicioLinea;
    }
}
